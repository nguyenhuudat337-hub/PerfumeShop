import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (!email.trim()) {
      setError('Vui lòng nhập email')
      return
    }

    try {
      setLoading(true)

      const res = await api.post('/auth/forgot-password', {
        email: email.trim(),
      })

      setMessage(res.data.message)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Quên mật khẩu
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-4">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-600 mb-4">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm text-rose-600 hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
