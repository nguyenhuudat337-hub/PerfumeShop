//Nó chịu trách nhiệm xử lý các API liên quan đến đơn hàng
//có 3 API: POST /api/orders, GET /api/orders, GET /api/orders/:id
import express from 'express'
import pool from '../db/pool.js'
import { protect } from '../middleware/auth.js'
import { adminOnly } from '../middleware/admin.js'

//tạo router
const router = express.Router()

// ==================== TẠO ĐƠN HÀNG TỪ GIỎ HÀNG ====================
router.post('/', protect, async (req, res) => {
  const client = await pool.connect() // lấy 1 connection riêng để transaction

  try {
    const { shipping_address, note,phone  } = req.body

    if (!phone) {
      return res.status(400).json({ message: 'Số điện thoại là bắt buộc' })
    }

    // Chỉ cho phép số, có thể bắt đầu bằng 0 hoặc +84
    // Ví dụ hợp lệ: 0901234567, 0912345678, +84901234567
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/

    const normalizedPhone = phone.replace(/\s/g, '') // bỏ khoảng trắng

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        message: 'Số điện thoại không hợp lệ. Ví dụ: 0901234567',
      })
    }

    if (!shipping_address) {
      return res.status(400).json({ message: 'Địa chỉ giao hàng là bắt buộc' })
    }

    // Bắt đầu transaction
    await client.query('BEGIN')

    // 1. Lấy toàn bộ giỏ hàng của user
    const cartResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    )

    const cartItems = cartResult.rows

    if (cartItems.length === 0) {
      await client.query('ROLLBACK') //hủy những thay đổi đó, đưa database về trạng thái trước BEGIN.
      return res.status(400).json({ message: 'Giỏ hàng đang trống' })
    }

    // 2. Kiểm tra tồn kho
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          message: `Sản phẩm "${item.name}" chỉ còn ${item.stock} sản phẩm`,
        })
      }
    }

    // 3. Tính tổng tiền
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)

    // 4. Tạo đơn hàng
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address,phone, note, status)
       VALUES ($1, $2, $3, $4,$5, 'pending')
       RETURNING *`,
      [req.user.id, totalAmount, shipping_address, normalizedPhone, note || null]
    )

    const order = orderResult.rows[0]

    // 5. Tạo order_items + trừ stock
    for (const item of cartItems) {
      // Thêm chi tiết đơn
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      )

      // Trừ tồn kho
      await client.query(
        `UPDATE products
         SET stock = stock - $1, updated_at = NOW()
         WHERE id = $2`,
        [item.quantity, item.product_id]
      )
    }

    // 6. Xóa giỏ hàng
    await client.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.id]
    )

    // Commit nếu mọi thứ thành công
    await client.query('COMMIT')

    res.status(201).json({
      message: 'Đặt hàng thành công',
      order,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ message: 'Lỗi server khi đặt hàng' })
  } finally {
    client.release() // trả connection về pool
  }
})

// ==================== LẤY DANH SÁCH ĐƠN HÀNG CỦA USER ====================
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, total_amount, status, shipping_address,phone, note, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})



// ==================== ADMIN: LẤY TẤT CẢ ĐƠN HÀNG ====================
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.shipping_address, o.phone, o.note, o.created_at,
              u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})


// ==================== LẤY CHI TIẾT 1 ĐƠN HÀNG ====================
router.get('/:id', protect, async (req, res) => {
  try {
    // Lấy thông tin đơn
    const orderResult = await pool.query(
      `SELECT id, total_amount, status, shipping_address,phone, note, created_at
       FROM orders
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    const order = orderResult.rows[0]

    // Lấy chi tiết sản phẩm trong đơn
    const itemsResult = await pool.query(
      `SELECT 
        oi.quantity, oi.price,
        p.name AS product_name, p.image_url,
        b.name AS brand_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN brands b ON p.brand_id = b.id
       WHERE oi.order_id = $1`,
      [order.id]
    )

    res.json({
      ...order,
      items: itemsResult.rows,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})




// ==================== ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN ====================
//patch dùng để cập nhật một phần resource
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled']

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Status phải là một trong: ${allowed.join(', ')}`,
      })
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, total_amount, created_at`,
      [status, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    res.json({
      message: 'Cập nhật trạng thái thành công',
      order: result.rows[0],
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})



export default router