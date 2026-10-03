import { useState, useEffect } from 'react'
import api from '../../api/axios'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled']

const statusLabel = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}


export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      (o.phone || '').includes(q) ||
      (o.user_email || '').toLowerCase().includes(q) ||
      (o.user_name || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q)
    const matchStatus = !filterStatus || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const formatMoney = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all')
      setOrders(res.data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Không tải được đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <p className="text-center text-gray-500 py-10">Đang tải...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tìm SĐT, email, tên, mã đơn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 py-16 bg-white border rounded-xl">
          Chưa có đơn hàng nào
        </p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Mã: <span className="font-mono">{order.id.slice(0, 8)}...</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.user_name} ({order.user_email})
                  </p>
                  <p className="text-sm text-gray-500">
                    SĐT: {order.phone || '—'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.shipping_address}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <p className="font-bold text-rose-600">{formatMoney(order.total_amount)}</p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColor[order.status] || ''
                    }`}
                  >
                    {statusLabel[order.status] || order.status}
                  </span>
                  <div>
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}