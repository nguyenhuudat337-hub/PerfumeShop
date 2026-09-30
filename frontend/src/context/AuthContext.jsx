//AuthContext cho các component biết là ai đang đăng nhập, thực hiện đăng nhập/ xuất, khôi phục trạng thái đăng nhập khi F5
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext() //tạo một context lưu dữ diệu dùng chung

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) //lấy dữ liệu từ context