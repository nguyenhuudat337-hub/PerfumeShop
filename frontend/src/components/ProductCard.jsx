import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const formatMoney = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.brand_name}</p>
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
        <p className="text-rose-600 font-semibold">{formatMoney(product.price)}</p>
      </div>
    </Link>
  )
}