# Perfume Shop – Website bán nước hoa

Ứng dụng web Full Stack bán nước hoa: xem sản phẩm, thêm giỏ hàng, đặt hàng và theo dõi đơn hàng.

---

## Tính năng chính

### Người dùng
- Đăng ký / Đăng nhập (JWT)
- Xem danh sách sản phẩm (tìm kiếm, lọc theo giới tính)
- Xem chi tiết sản phẩm
- Thêm / sửa / xóa sản phẩm trong giỏ hàng
- Đặt hàng (địa chỉ giao hàng + ghi chú)
- Xem lịch sử đơn hàng và chi tiết từng đơn

### Kỹ thuật nổi bật
- SQL thuần với `pg` (không dùng Prisma) – học JOIN, Transaction, parameterized query
- Transaction khi đặt hàng (tạo order + order_items + trừ stock + xóa cart)
- REST API + React SPA

---

## Tech stack

| Phần | Công nghệ |
|------|-----------|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Context API |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) + `pg` (node-postgres) |
| Auth | JWT + bcryptjs |

---

## Cấu trúc thư mục

```
PerfumeShop/
├── backend/
│   ├── db/
│   │   └── schema.sql          # CREATE TABLE
│   ├── src/
│   │   ├── db/
│   │   │   └── pool.js         # Connection pool
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── brands.js
│   │   │   ├── products.js
│   │   │   ├── cart.js
│   │   │   └── orders.js
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   └── Orders.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Database (PostgreSQL)

Các bảng chính:

| Bảng | Mô tả |
|------|--------|
| `users` | Người dùng (role: user / admin) |
| `brands` | Thương hiệu nước hoa |
| `products` | Sản phẩm (giá, tồn kho, giới tính, dung tích...) |
| `cart_items` | Giỏ hàng (UNIQUE user + product) |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết sản phẩm trong đơn |

Schema đầy đủ nằm trong `backend/db/schema.sql`.

Chạy schema trên Neon: mở **SQL Editor** → paste nội dung `schema.sql` → Run.

---

## Cách chạy dự án

### 1. Backend

```bash
cd backend
npm install
```

Tạo file `.env`:

```env
DATABASE_URL=postgresql://...connection_string_neon...
JWT_SECRET=your_secret_key_here
PORT=5002
```

Chạy server:

```bash
npm run dev
```

API chạy tại: `http://localhost:5002`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App chạy tại: `http://localhost:5173`

> Đảm bảo backend đang chạy trước khi dùng frontend.

---

## API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |

### Brands
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| GET | `/api/brands` | Không | Danh sách thương hiệu |
| POST | `/api/brands` | Có | Tạo thương hiệu |

### Products
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| GET | `/api/products` | Không | Danh sách (filter: brand_id, gender, min_price, max_price, search) |
| GET | `/api/products/:id` | Không | Chi tiết sản phẩm |
| POST | `/api/products` | Có | Tạo 1 hoặc nhiều sản phẩm |
| PUT | `/api/products/:id/image` | Có | Cập nhật ảnh sản phẩm |

### Cart (cần token)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/cart` | Xem giỏ hàng |
| POST | `/api/cart` | Thêm vào giỏ |
| PUT | `/api/cart/:id` | Sửa số lượng |
| DELETE | `/api/cart/:id` | Xóa 1 item |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ |

### Orders (cần token)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/orders` | Đặt hàng (từ giỏ) |
| GET | `/api/orders` | Danh sách đơn của user |
| GET | `/api/orders/:id` | Chi tiết 1 đơn |

Header cho API cần auth:

```
Authorization: Bearer <token>
```

---

## Luồng đặt hàng (Transaction)

Khi `POST /api/orders`:

1. `BEGIN`
2. Lấy giỏ hàng + kiểm tra tồn kho
3. Tạo `orders`
4. Tạo `order_items` + trừ `products.stock`
5. Xóa `cart_items`
6. `COMMIT` (hoặc `ROLLBACK` nếu lỗi)

→ Đảm bảo dữ liệu nhất quán.

---

## Scripts gợi ý

**Backend `package.json`:**
```json
"type": "module",
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js"
}
```

---

## Tác giả

**Nguyễn Hữu Đạt**  
- GitHub: [nguyenhuudat337-hub](https://github.com/nguyenhuudat337-hub)  
- Email: nguyenhuudat337@gmail.com

---

## Ghi chú

- Dự án phục vụ học tập Full Stack và luyện SQL thuần với PostgreSQL.
- Có thể mở rộng: trang Admin, thanh toán, upload ảnh, phân trang sản phẩm.
