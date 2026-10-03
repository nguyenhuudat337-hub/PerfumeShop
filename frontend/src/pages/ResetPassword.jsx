import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    // Kiểm tra token
    if (!token) {
      setError('Token không hợp lệ hoặc bị thiếu')
      return
    }

    // Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp')
      return
    }

    try {
      setLoading(true)

      const res = await api.post('/auth/reset-password', {
        token,
        password,
      })

      setMessage(res.data.message)

      // Xóa nội dung form
      setPassword('')
      setConfirmPassword('')

      // Chuyển về trang login sau 2 giây
      setTimeout(() => {
        navigate('/login')
      }, 2000)
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
          Đặt lại mật khẩu
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {!token ? (
          <div>
            <p className="text-sm text-red-500 text-center mb-6">
              Token không hợp lệ hoặc bị thiếu.
            </p>

            <Link
              to="/forgot-password"
              className="block text-center text-sm text-rose-600 hover:underline"
            >
              Yêu cầu đặt lại mật khẩu mới
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Mật khẩu mới */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Mật khẩu mới
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Nhập lại mật khẩu */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Nhập lại mật khẩu
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Yêu cầu mật khẩu */}
            <div className="text-xs text-gray-500 mb-4">
              <p>Mật khẩu phải:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Nhiều hơn 8 ký tự</li>
                <li>Có ít nhất 1 chữ in hoa</li>
                <li>Có ít nhất 1 số</li>
                <li>Có ít nhất 1 ký tự đặc biệt</li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 mb-4">
                {error}
              </p>
            )}

            {/* Success */}
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
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

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

export default ResetPassword
