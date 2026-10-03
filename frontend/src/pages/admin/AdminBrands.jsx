import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', logo_url: '' })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' | 'asc'

  // Lọc phía client
  const filteredBrands = brands
  .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands')
      setBrands(res.data)
    } catch (err) {
      setError('Không tải được brands')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const resetForm = () => {
    setForm({ name: '', description: '', logo_url: '' })
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/brands/${editId}`, form)
      } else {
        await api.post('/brands', form)
      }
      resetForm()
      fetchBrands()
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (brand) => {
    setEditId(brand.id)
    setForm({
      name: brand.name || '',
      description: brand.description || '',
      logo_url: brand.logo_url || '',
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa thương hiệu này?')) return
    try {
      await api.delete(`/brands/${id}`)
      fetchBrands()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại')
    }
  }

  if (loading) return <p className="text-center text-gray-500 py-10">Đang tải...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý thương hiệu</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 mb-8 space-y-4">
        <h2 className="font-semibold">{editId ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            required
            placeholder="Tên brand *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <input
            placeholder="Logo URL"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
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


      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-8 w-full md:w-64 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
        />

        <div className="flex gap-2">
          <button
              type="button"
              onClick={() => setSortOrder('desc')}
              className={`h-11 px-4 rounded-lg text-sm border transition ${
                sortOrder === 'desc'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-gray-600 hover:border-rose-400'
              }`}
            >
              Mới nhất
            </button>
            <button
              type="button"
              onClick={() => setSortOrder('asc')}
              className={`h-11 px-4 rounded-lg text-sm border transition ${
                sortOrder === 'asc'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-gray-600 hover:border-rose-400'
              }`}
            >
              Cũ nhất
          </button>
        </div>
      </div>


      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Tên</th>
              <th className="text-left px-4 py-3">Mô tả</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBrands.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-gray-500">{b.description || '—'}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => handleEdit(b)} className="text-blue-600 hover:underline">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {brands.length === 0 && (
          <p className="text-center text-gray-500 py-8">Chưa có brand nào</p>
        )}
      </div>
    </div>
  )
}