import express from 'express'
import pool from '../db/pool.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// ==================== LẤY GIỎ HÀNG CỦA USER ====================
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ci.id,
        ci.quantity,
        ci.created_at,
        p.id AS product_id,
        p.name AS product_name,
        p.price,
        p.image_url,
        p.stock,
        b.name AS brand_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN brands b ON p.brand_id = b.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    )

    // Tính tổng tiền
    const items = result.rows
    const total = items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)

    res.json({
      items,
      total,
      item_count: items.length,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ==================== THÊM VÀO GIỎ HÀNG ====================
router.post('/', protect, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body

    if (!product_id) {
      return res.status(400).json({ message: 'product_id là bắt buộc' })
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' })
    }

    // Kiểm tra sản phẩm tồn tại và còn hàng
    const productCheck = await pool.query(
      'SELECT id, stock, name FROM products WHERE id = $1 AND is_active = TRUE',
      [product_id]
    )

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }

    const product = productCheck.rows[0]

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Sản phẩm chỉ còn ${product.stock} sản phẩm` })
    }

    // Nếu đã có trong giỏ → cộng dồn số lượng
    // Nếu chưa có → thêm mới
    // Dùng ON CONFLICT (nhờ UNIQUE user_id + product_id)
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET 
         quantity = cart_items.quantity + EXCLUDED.quantity,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, product_id, quantity]
    )

    res.status(201).json({
      message: 'Đã thêm vào giỏ hàng',
      item: result.rows[0],
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ==================== CẬP NHẬT SỐ LƯỢNG ====================
router.put('/:id', protect, async (req, res) => {
  try {
    const { quantity } = req.body
    const cartItemId = req.params.id

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' })
    }

    // Chỉ cho phép sửa item của chính user
    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, cartItemId, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy item trong giỏ hàng' })
    }

    res.json({
      message: 'Đã cập nhật số lượng',
      item: result.rows[0],
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ==================== XÓA 1 ITEM KHỎI GIỎ ====================
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM cart_items
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy item trong giỏ hàng' })
    }

    res.json({ message: 'Đã xóa khỏi giỏ hàng' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ==================== XÓA TOÀN BỘ GIỎ HÀNG ====================
router.delete('/', protect, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.id]
    )

    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router