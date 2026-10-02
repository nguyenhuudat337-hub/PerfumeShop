


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), --khác với INT thì UUID là 1 chuỗi định danh dài, DEFAULT gen_random_uuid(): tự tạo id bạn không cần truyền giá trị mặc đinh
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin')) --CHECK: ràng buộc dữ liệu, role chỉ được phép là 1 trong 2 user, admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE brands(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id      UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT, --REFERENCES: khoá ngoại 
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price         DECIMAL(12, 2) NOT NULL CHECK (price >= 0), --CHECK: ràng buộc dữ liệu
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0), 
  gender        VARCHAR(20) CHECK (gender IN ('nam', 'nu', 'unisex')),
  volume_ml     INTEGER,                          -- dung tích (ml)
  concentration VARCHAR(50),                      -- Eau de Parfum, Eau de Toilette...
  image_url     TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng cart_items (giỏ hàng)
CREATE TABLE cart_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)                     -- mỗi user chỉ có 1 dòng cho 1 sản phẩm
);

-- Bảng orders (đơn hàng)
CREATE TABLE orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_amount  DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
  status        VARCHAR(30) DEFAULT 'pending' 
                CHECK (status IN ('pending', 'confirmed', 'shipping', 'completed', 'cancelled')),
  shipping_address TEXT,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- Bảng order_items (chi tiết đơn hàng)
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  price         DECIMAL(12, 2) NOT NULL,          -- giá tại thời điểm mua
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- Index để tăng tốc truy vấn
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);


--Thêm cột phone vào bảng orders để lưu số điện thoại của khách hàng
ALTER TABLE orders
ADD COLUMN phone VARCHAR(20);


