import express from 'express'
import pool from '../db/pool.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Lấy danh sách sản phẩm (có filter)
// Query params: brand_id, gender, min_price, max_price, search
router.get('/', async (req, res) => {
  try {
    //lấy dữ liệu từ URL, VD: GET /api/products?brand_id=123&gender=nam&min_price=2000000 -> req.query = { brand_id: '123', gender: 'nam', min_price: '2000000'}
    const { brand_id, gender, min_price, max_price, search } = req.query
    //tạo SQL ban đầu, SQL được lưu ở một biến JS, sau này JS sẽ nối thêm vào biến query
    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock,
        p.gender, p.volume_ml, p.concentration, p.image_url,
        p.is_active, p.created_at,
        b.id AS brand_id, b.name AS brand_name
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = TRUE
    `

    const params = [] //chèn vào lệnh SQL query
    let paramIndex = 1 //dùng để tạo $1,$2,$3,...


    //Nối tiếp vào query nếu như sau dấu hỏi ? có params
    if (brand_id) {
      query += ` AND p.brand_id = $${paramIndex}`
      params.push(brand_id)
      paramIndex++
    }

    if (gender) {
      query += ` AND p.gender = $${paramIndex}`
      params.push(gender)
      paramIndex++
    }

    if (min_price) {
      query += ` AND p.price >= $${paramIndex}`
      params.push(min_price)
      paramIndex++
    }

    if (max_price) {
      query += ` AND p.price <= $${paramIndex}`
      params.push(max_price)
      paramIndex++
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }


    //sắp xếp theo thời gian tạo mới nhất (giảm dần)
    query += ` ORDER BY p.created_at DESC`
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// Lấy chi tiết 1 sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.*, 
        b.name AS brand_name, b.description AS brand_description
       FROM products p
       JOIN brands b ON p.brand_id = b.id
       WHERE p.id = $1 AND p.is_active = TRUE`, //is_active = TRUE: sản phẩm đang được kích hoạt/đang được phép hiển thị và sử dụng trên website.
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// Tạo sản phẩm mới (cần đăng nhập)
// Tạo sản phẩm mới (1 hoặc nhiều sản phẩm)
// Body có thể là:
// 1. Object: { brand_id, name, price, ... }
// 2. Array: [ { brand_id, name, price, ... }, { ... } ]
router.post('/', protect, async (req, res) => {
  try {
    const body = req.body

    // Chuẩn hóa thành mảng
    const products = Array.isArray(body) ? body : [body]

    if (products.length === 0) {
      return res.status(400).json({ message: 'Danh sách sản phẩm trống' })
    }

    const created = []
    const errors = []

    for (let i = 0; i < products.length; i++) {
      const item = products[i]
      const {
        brand_id,
        name,
        description,
        price,
        stock,
        gender,
        volume_ml,
        concentration,
        image_url,
      } = item

      // Validate từng item
      if (!brand_id || !name || price === undefined) {
        errors.push({
          index: i,
          name: name || '(không có tên)',
          message: 'Thiếu thông tin bắt buộc (brand_id, name, price)',
        })
        continue
      }

      // Kiểm tra trùng (cùng brand + cùng tên)
      const existing = await pool.query(
        `SELECT id FROM products 
         WHERE brand_id = $1 AND LOWER(name) = LOWER($2)`,
        [brand_id, name]
      )

      if (existing.rows.length > 0) {
        errors.push({
          index: i,
          name,
          message: 'Sản phẩm đã tồn tại trong thương hiệu',
        })
        continue
      }

      try {
        const result = await pool.query(
          `INSERT INTO products 
            (brand_id, name, description, price, stock, gender, volume_ml, concentration, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            brand_id,
            name,
            description || null,
            price,
            stock || 0,
            gender || null,
            volume_ml || null,
            concentration || null,
            image_url || null,
          ]
        )
        created.push(result.rows[0])
      } catch (err) {
        errors.push({
          index: i,
          name,
          message: err.code === '23503' ? 'brand_id không tồn tại' : 'Lỗi khi thêm sản phẩm',
        })
      }
    }

    // Nếu không thêm được cái nào
    if (created.length === 0) {
      return res.status(400).json({
        message: 'Không thêm được sản phẩm nào',
        errors,
      })
    }

    res.status(201).json({
      message: `Đã thêm ${created.length}/${products.length} sản phẩm`,
      created,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})





export default router