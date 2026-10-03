import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Link xác thực không hợp lệ')
      return
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success')
        setMessage(res.data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Xác thực thất bại')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        {status === 'loading' && <p>Đang xác thực...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-600 mb-4">{message}</p>
            <Link to="/login" className="text-rose-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600 mb-4">{message}</p>
            <Link to="/register" className="text-rose-600 hover:underline">
              Đăng ký lại
            </Link>
          </>
        )}
      </div>
    </div>
  )
}