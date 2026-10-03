import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)


  const [search, setSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterStatus, setFilterStatus] = useState('') // '', 'active', 'hidden'

    const filteredProducts = products.filter((p) => {
        const matchName = p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand_name || '').toLowerCase().includes(search.toLowerCase())
        const matchBrand = !filterBrand || p.brand_id === filterBrand
        const matchStatus = !filterStatus || (filterStatus === 'active' && p.is_active) || (filterStatus === 'hidden' && !p.is_active)
        return matchName && matchBrand && matchStatus
    })

  const emptyForm = {
    brand_id: '',
    name: '',
    description: '',
    price: '',
    stock: 0,
    gender: 'unisex',
    volume_ml: '',
    concentration: '',
    image_url: '',
  }
  const [form, setForm] = useState(emptyForm)

  const formatMoney = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  const fetchData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        api.get('/products/admin/all'),
        api.get('/brands'),
      ])
      setProducts(pRes.data)
      setBrands(bRes.data)
    } catch (err) {
      setError('Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      volume_ml: form.volume_ml ? Number(form.volume_ml) : null,
    }

    try {
      if (editId) {
        await api.put(`/products/${editId}`, payload)
      } else {
        await api.post('/products', payload)
      }
      resetForm()
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (p) => {
    setEditId(p.id)
    setForm({
      brand_id: p.brand_id || '',
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      stock: p.stock ?? 0,
      gender: p.gender || 'unisex',
      volume_ml: p.volume_ml || '',
      concentration: p.concentration || '',
      image_url: p.image_url || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRestore = async (id) => {
    try {
      await api.put(`/products/${id}`, { is_active: true })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Hiện lại thất bại')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Ẩn sản phẩm này?')) return
    try {
      await api.delete(`/products/${id}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  if (loading) return <p className="text-center text-gray-500 py-10">Đang tải...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý sản phẩm</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 mb-8 space-y-4">
        <h2 className="font-semibold">{editId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            required
            value={form.brand_id}
            onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">-- Chọn brand --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input
            required
            placeholder="Tên sản phẩm *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          />
          <input
            required
            type="number"
            placeholder="Giá *"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          />
          <input
            type="number"
            placeholder="Tồn kho"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          />
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
            <option value="unisex">Unisex</option>
          </select>
          <input
            type="number"
            placeholder="Dung tích (ml)"
            value={form.volume_ml}
            onChange={(e) => setForm({ ...form, volume_ml: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          />
          <input
            placeholder="Nồng độ (EDP, EDT...)"
            value={form.concentration}
            onChange={(e) => setForm({ ...form, concentration: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          />
          <input
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 md:col-span-2"
          />
          <input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 md:col-span-3"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-rose-600 text-white px-5 py-2 rounded-lg hover:bg-rose-700 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="px-5 py-2 border rounded-lg">
              Hủy
            </button>
          )}
        </div>
      </form>




      <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
                type="text"
                placeholder="Tìm tên / brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            >
                <option value="">Tất cả brand</option>
                {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang bán</option>
                <option value="hidden">Đã ẩn</option>
            </select>
        </div>

      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Tên</th>
              <th className="text-left px-4 py-3">Brand</th>
              <th className="text-right px-4 py-3">Giá</th>
              <th className="text-right px-4 py-3">Kho</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.brand_name}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(p.price)}</td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3">
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                        p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                        {p.is_active ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">
                        Sửa
                    </button>
                    {p.is_active ? (
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                        Ẩn
                        </button>
                    ) : (
                        <button
                        onClick={() => handleRestore(p.id)}
                        className="text-green-600 hover:underline"
                        >
                        Hiện lại
                        </button>
                    )}
                    </td>
                </tr>
                ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-gray-500 py-8">Chưa có sản phẩm</p>
        )}
      </div>
    </div>
  )
}