import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db/pool.js'
import generateToken from '../utils/generateToken.js'

const router = express.Router()

// ==================== ĐĂNG KÝ ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body //req.body được gửi từ frontend 

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
    }

    // Kiểm tra email đã tồn tại chưa
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email đã được sử dụng' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user mới
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    )

    const user = result.rows[0]

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ==================== ĐĂNG NHẬP ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Tìm user theo email
    const result = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    const user = result.rows[0]

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router