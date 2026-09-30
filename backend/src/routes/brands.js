import express from 'express'
import pool from '../db/pool.js'
import { protect } from '../middleware/auth.js'

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

// Tạo brand mới (tạm thời mở, sau này chỉ admin)
router.post('/', protect, async (req, res) => {
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
    // Lỗi unique name
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Thương hiệu này đã tồn tại' })
    }
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router