import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `text-sm transition ${
      isActive ? 'text-rose-600 font-semibold' : 'text-gray-600 hover:text-rose-600'
    }`

  const isAdmin = user?.role === 'admin'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink
          to={isAdmin ? '/admin/products' : '/'}
          className="text-xl font-bold text-rose-600"
        >
          {isAdmin ? 'Perfume Admin' : 'Perfume Shop'}
        </NavLink>

        <nav className="flex items-center gap-6">
          {user && isAdmin ? (
            <>
              <NavLink to="/admin/brands" className={linkClass}>
              Quản lý thương hiệu
              </NavLink>
              <NavLink to="/admin/products" className={linkClass}>
              Quản lý sản phẩm
              </NavLink>
              <NavLink to="/admin/orders" className={linkClass}>
              Quản lý đơn hàng
              </NavLink>
              <span className="text-sm text-gray-500">Admin: {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-500"
              >
                Đăng xuất
              </button>
            </>
          ) : user ? (
            <>
              <NavLink to="/" end className={linkClass}>
                Sản phẩm
              </NavLink>
              <NavLink to="/cart" className={linkClass}>
                Giỏ hàng
              </NavLink>
              <NavLink to="/orders" className={linkClass}>
                Đơn hàng
              </NavLink>
              <span className="text-sm text-gray-500">Xin chào, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-500"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Đăng nhập
              </NavLink>
              <NavLink
                to="/register"
                className="text-sm bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
              >
                Đăng ký
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}