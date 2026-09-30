import { useState, useEffect } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (gender) params.gender = gender

      const res = await api.get('/products', { params })
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [gender])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
      <main className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm nước hoa</h1>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, thương hiệu..."
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
            >
              Tìm
            </button>
          </form>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">Tất cả</option>
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        {/* Grid sản phẩm */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Chưa có sản phẩm nào</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
  )
}