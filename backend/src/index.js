import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authroutes from './routes/auth.js'
import brandRoutes from './routes/brands.js'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'

const app = express()
const PORT = process.env.PORT || 5002


app.use(cors()) //cho phép frontend ở origin (địa chỉ HTTP) khác gọi API backend
app.use(express.json())  //Nếu request gửi dữ liệu dạng JSON, hãy đọc JSON đó và đưa vào req.body.


app.get('/', (req, res) => {
    res.json({ message: 'Perfume Shop API is running' })
})
  
app.use('/api/auth',authroutes)
app.use('/api/brands',brandRoutes)  
app.use('/api/products',productRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/orders',orderRoutes)

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`)
})