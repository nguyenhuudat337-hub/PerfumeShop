import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data)
      } catch (err) {
        console.error(err)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const formatMoney = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setAdding(true)
    setMessage('')

    try {
      await api.post('/cart', {
        product_id: product.id,
        quantity: Number(quantity),
      })
      setMessage('Đã thêm vào giỏ hàng!')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Thêm vào giỏ thất bại')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Đang tải...</p>
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm</p>
        <Link to="/" className="text-rose-600 hover:underline">
          ← Về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-sm text-gray-500 hover:text-rose-600 mb-6 inline-block">
        ← Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ảnh */}
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No image</span>
          )}
        </div>

        {/* Thông tin */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.brand_name}</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <p className="text-2xl font-semibold text-rose-600 mb-4">
            {formatMoney(product.price)}
          </p>

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            {product.gender && (
              <p>
                <span className="font-medium">Giới tính:</span>{' '}
                {product.gender === 'nam' ? 'Nam' : product.gender === 'nu' ? 'Nữ' : 'Unisex'}
              </p>
            )}
            {product.volume_ml && (
              <p>
                <span className="font-medium">Dung tích:</span> {product.volume_ml} ml
              </p>
            )}
            {product.concentration && (
              <p>
                <span className="font-medium">Nồng độ:</span> {product.concentration}
              </p>
            )}
            <p>
              <span className="font-medium">Tồn kho:</span> {product.stock}
            </p>
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{product.description}</p>
          )}

          {/* Số lượng + Thêm giỏ */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium">Số lượng:</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-20 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock < 1}
            className="w-full sm:w-auto bg-rose-600 text-white px-8 py-3 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition"
          >
            {product.stock < 1
              ? 'Hết hàng'
              : adding
              ? 'Đang thêm...'
              : 'Thêm vào giỏ hàng'}
          </button>

          {message && (
            <p
              className={`mt-3 text-sm ${
                message.includes('thất bại') || message.includes('còn')
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}