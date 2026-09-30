import { NavLink, useNavigate } from 'react-router-dom' //NavLink: tạo link chuyển trang không cần tải lại toàn trang, có isActive
// useNavigate:  
import { useAuth } from '../context/AuthContext' //trạng thái đăng nhập

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate() //điều hướng 

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Class cho link thường / link đang active
  const linkClass = ({ isActive }) =>
    `text-sm transition ${
      isActive
        ? 'text-rose-600 font-semibold'
        : 'text-gray-600 hover:text-rose-600'
    }`

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-bold text-rose-600">
          Perfume Shop
        </NavLink>

        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            Sản phẩm
          </NavLink>

          {user ? (
            <>
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