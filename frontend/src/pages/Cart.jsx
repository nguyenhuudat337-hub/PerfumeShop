import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [cart, setCart] = useState({ items: [], total: 0, item_count: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // id đang update

  const formatMoney = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')
      setCart(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [user])

  // Cập nhật số lượng
  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    setUpdating(itemId)
    try {
      await api.put(`/cart/${itemId}`, { quantity: Number(quantity) })
      await fetchCart()
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setUpdating(null)
    }
  }

  // Xóa 1 item
  const handleRemove = async (itemId) => {
    if (!window.confirm('Xóa sản phẩm này khỏi giỏ hàng?')) return
    try {
      await api.delete(`/cart/${itemId}`)
      await fetchCart()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  // Xóa toàn bộ
  const handleClear = async () => {
    if (!window.confirm('Xóa toàn bộ giỏ hàng?')) return
    try {
      await api.delete('/cart')
      await fetchCart()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Đang tải giỏ hàng...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng</h1>
        {cart.items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link
            to="/"
            className="inline-block bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
              >
                {/* Ảnh */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{item.brand_name}</p>
                  <Link
                    to={`/products/${item.product_id}`}
                    className="font-medium text-gray-800 hover:text-rose-600 line-clamp-2"
                  >
                    {item.product_name}
                  </Link>
                  <p className="text-rose-600 font-semibold mt-1">
                    {formatMoney(item.price)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <label className="text-sm text-gray-500">Số lượng:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      disabled={updating === item.id}
                      onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                      className="w-16 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-sm text-red-500 hover:text-red-700 ml-auto"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Số sản phẩm</span>
                <span>{cart.item_count}</span>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-4 mb-6">
                <span>Tổng cộng</span>
                <span className="text-rose-600">{formatMoney(cart.total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition"
              >
                Tiến hành đặt hàng
              </button>

              <Link
                to="/"
                className="block text-center text-sm text-gray-500 hover:text-rose-600 mt-3"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}