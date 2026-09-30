import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '')

  const formatMoney = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  const statusMap = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders')
        setOrders(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  const handleViewDetail = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`)
      setSelectedOrder(res.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Không lấy được chi tiết đơn')
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Đang tải đơn hàng...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
          {successMessage}
          <button
            onClick={() => setSuccessMessage('')}
            className="ml-2 text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
          <Link
            to="/"
            className="inline-block bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status] || statusMap.pending
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Mã đơn: <span className="font-mono text-gray-700">{order.id.slice(0, 8)}...</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-semibold text-rose-600">
                    {formatMoney(order.total_amount)}
                  </p>
                  <button
                    onClick={() => handleViewDetail(order.id)}
                    className="text-sm text-rose-600 hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal chi tiết đơn */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Chi tiết đơn hàng</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-1">
              Ngày đặt: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Địa chỉ: {selectedOrder.shipping_address}
            </p>
            {selectedOrder.note && (
              <p className="text-sm text-gray-500 mb-4">Ghi chú: {selectedOrder.note}</p>
            )}

            <div className="border-t pt-4 space-y-3">
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-gray-500">
                      {item.brand_name} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg border-t mt-4 pt-4">
              <span>Tổng cộng</span>
              <span className="text-rose-600">
                {formatMoney(selectedOrder.total_amount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}