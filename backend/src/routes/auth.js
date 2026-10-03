import express from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db/pool.js'
import generateToken from '../utils/generateToken.js'
import crypto from 'crypto'
import { sendVerificationEmail } from '../utils/sendEmail.js'
import { sendResetPasswordEmail } from '../utils/sendEmail.js'
const router = express.Router()

// ==================== ĐĂNG KÝ ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password ,confirmPassword} = req.body //req.body được gửi từ frontend 

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
    }

    if (password.length <= 8) {
      return res.status(400).json({
        message: 'Mật khẩu phải nhiều hơn 8 ký tự',
      })
    }
    
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    
    if (!hasUpperCase || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        message:
          'Mật khẩu phải có ít nhất 1 chữ in hoa, 1 số và 1 ký tự đặc biệt',
      })
    }

    if (confirmPassword !== password) {
      return res.status(400).json({
        message:
          'Mật khẩu phải có ít nhất 1 chữ in hoa, 1 số và 1 ký tự đặc biệt',
      })
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
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    const result = await pool.query(
      `INSERT INTO users (name, email, password, verification_token, verification_token_expires, email_verified)
      VALUES ($1, $2, $3, $4, $5, FALSE)
      RETURNING id, name, email, role, email_verified`,
      [name, email, hashedPassword, verificationToken, tokenExpires]
    )

    const user = result.rows[0]

    // Gửi email (không chặn response nếu mail lỗi nhẹ – tùy bạn)
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (mailErr) {
      console.error('Gửi email thất bại:', mailErr)
      // Có thể xóa user hoặc vẫn cho đăng ký và báo "kiểm tra email"
    }

    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      email: user.email,
      // Không trả token login nếu chưa verify – bắt buộc xác thực trước
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})


// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({ message: 'Thiếu token xác thực' })
    }

    const result = await pool.query(
      `SELECT id, email_verified, verification_token_expires
       FROM users
       WHERE verification_token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Token không hợp lệ' })
    }

    const user = result.rows[0]

    if (user.email_verified) {
      return res.json({ message: 'Email đã được xác thực trước đó' })
    }

    if (new Date() > new Date(user.verification_token_expires)) {
      return res.status(400).json({ message: 'Token đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu gửi lại email.' })
    }

    await pool.query(
      `UPDATE users
       SET email_verified = TRUE,
           verification_token = NULL,
           verification_token_expires = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    )

    res.json({ message: 'Xác thực email thành công. Bạn có thể đăng nhập.' })
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
      'SELECT id, name, email, password, role, email_verified FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    const user = result.rows[0]

    if (!user.email_verified) {
      return res.status(403).json({
        message: 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.',
      })
    }

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


// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' })
    }

    const successMsg =
      'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.'

    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.json({ message: successMsg })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expires = $2, updated_at = NOW() WHERE id = $3`,
      [resetToken, expires, result.rows[0].id]
    )

    try {
      await sendResetPasswordEmail(email, resetToken)
    } catch (mailErr) {
      console.error('Gửi email reset thất bại:', mailErr)
      console.log(
        'LINK RESET (dev):',
        `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      )
    }

    res.json({ message: successMsg })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Thiếu token hoặc mật khẩu mới' })
    }

    if (password.length <= 8) {
      return res.status(400).json({ message: 'Mật khẩu phải nhiều hơn 8 ký tự' })
    }
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    if (!hasUpperCase || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        message: 'Mật khẩu phải có ít nhất 1 chữ in hoa, 1 số và 1 ký tự đặc biệt',
      })
    }

    const result = await pool.query(
      `SELECT id, reset_token_expires FROM users WHERE reset_token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Token không hợp lệ' })
    }

    if (new Date() > new Date(result.rows[0].reset_token_expires)) {
      return res.status(400).json({ message: 'Token đã hết hạn' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await pool.query(
      `UPDATE users
       SET password = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id]
    )

    res.json({ message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router