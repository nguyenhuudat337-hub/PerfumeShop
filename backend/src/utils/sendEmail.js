import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: `"Perfume Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Xác thực email - Perfume Shop',
    html: `
      <h2>Xác thực tài khoản</h2>
      <p>Nhấn nút bên dưới để xác thực email của bạn:</p>
      <a href="${verifyUrl}"
         style="display:inline-block;padding:12px 24px;background:#e11d48;color:#fff;text-decoration:none;border-radius:8px;">
        Xác thực email
      </a>
      <p>Hoặc copy link: ${verifyUrl}</p>
      <p>Link hết hạn sau 24 giờ.</p>
    `,
  })
}

export const sendResetPasswordEmail = async (to, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  
    await transporter.sendMail({
      from: `"Perfume Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Đặt lại mật khẩu - Perfume Shop',
      html: `
        <h2>Đặt lại mật khẩu</h2>
        <p>Nhấn nút bên dưới để đặt lại mật khẩu (hết hạn sau 1 giờ):</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#e11d48;color:#fff;text-decoration:none;border-radius:8px;">
          Đặt lại mật khẩu
        </a>
      `,
    })
  }