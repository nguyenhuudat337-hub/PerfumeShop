
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import ProtectedRoute from './components/ProtectedRoute'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import AdminRoute from './components/AdminRoute'
import AdminBrands from './pages/admin/AdminBrands'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import UserRoute from './components/UserRoute'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages - không có Navbar */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin/products' : '/'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* Các trang có Navbar */}
        <Route element={<Layout />}>
          <Route path="/" element={<UserRoute><Home /></UserRoute>} />
          <Route path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }/>
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
            element={
              <AdminRoute>
                <Layout />
              </AdminRoute>
            }
          >
          <Route path="/admin/brands" element={<AdminBrands />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App