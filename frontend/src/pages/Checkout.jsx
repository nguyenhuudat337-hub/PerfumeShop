import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const formatMoney = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchCart = async () => {
      try {
        const res = await api.get('/cart')
        if (res.data.items.length === 0) {
          navigate('/cart')
          return
        }
        setCart(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
  
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng')
      return
    }
  
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }
  
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
    const normalizedPhone = phone.replace(/\s/g, '')
  
    if (!phoneRegex.test(normalizedPhone)) {
      setError('Số điện thoại không hợp lệ. Ví dụ: 0901234567')
      return
    }
  
    setSubmitting(true)
    try {
      await api.post('/orders', {
        shipping_address: shippingAddress.trim(),
        phone: normalizedPhone,
        note: note.trim() || null,
      })
      navigate('/orders', { state: { message: 'Đặt hàng thành công!' } })
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Đang tải...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đặt hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form địa chỉ */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 mb-2">Thông tin giao hàng</h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Địa chỉ giao hàng <span className="text-red-500">*</span>
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú thêm (không bắt buộc)"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
            </button>
          </form>
        </div>

        {/* Tóm tắt đơn */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Đơn hàng của bạn</h2>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-gray-800 whitespace-nowrap">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-lg font-bold border-t pt-4">
              <span>Tổng cộng</span>
              <span className="text-rose-600">{formatMoney(cart.total)}</span>
            </div>

            <Link
              to="/cart"
              className="block text-center text-sm text-gray-500 hover:text-rose-600 mt-4"
            >
              ← Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}