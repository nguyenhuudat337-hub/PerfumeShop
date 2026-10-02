import express from 'express'
import pool from '../db/pool.js'
import { protect } from '../middleware/auth.js'
import { adminOnly } from '../middleware/admin.js'

const router = express.Router()

// Lấy tất cả brands
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, logo_url, created_at FROM brands ORDER BY name ASC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// Tạo brand mới (chỉ admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, logo_url } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Tên thương hiệu là bắt buộc' })
    }

    const result = await pool.query(
      `INSERT INTO brands (name, description, logo_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, logo_url || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Thương hiệu này đã tồn tại' })
    }
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ==================== ADMIN: SỬA BRAND ====================
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, logo_url } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Tên thương hiệu là bắt buộc' })
    }

    const result = await pool.query(
      `UPDATE brands
       SET name = $1,
           description = $2,
           logo_url = $3
       WHERE id = $4
       RETURNING *`,
      [name, description || null, logo_url || null, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' })
    }

    res.json({
      message: 'Cập nhật thương hiệu thành công',
      brand: result.rows[0],
    })
  } catch (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Tên thương hiệu đã tồn tại' })
    }
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ==================== ADMIN: XÓA BRAND ====================
// Không xóa được nếu còn sản phẩm (do ON DELETE RESTRICT)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Kiểm tra còn sản phẩm thuộc brand này không
    const productCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM products WHERE brand_id = $1',
      [req.params.id]
    )

    if (productCount.rows[0].count > 0) {
      return res.status(400).json({
        message: `Không thể xóa vì còn ${productCount.rows[0].count} sản phẩm thuộc thương hiệu này`,
      })
    }

    const result = await pool.query(
      'DELETE FROM brands WHERE id = $1 RETURNING id, name',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' })
    }

    res.json({
      message: 'Đã xóa thương hiệu',
      brand: result.rows[0],
    })
  } catch (error) {
    console.error(error)
    // Phòng trường hợp DB vẫn chặn (RESTRICT)
    if (error.code === '23503') {
      return res.status(400).json({
        message: 'Không thể xóa vì còn sản phẩm thuộc thương hiệu này',
      })
    }
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router