import pg from 'pg' //thư viện PostgreSQL dành cho Node.js
import dotenv from 'dotenv' 


dotenv.config() //đọc env

const { Pool } = pg //lấy Pool từ pg, dùng để quản lý nhiều kết nối đến PostgreSQL

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized:false
    }
})

//lắng nghe các event (sự kiện)
pool.on('connect',() =>{
    console.log('Đã kết nối PostgreSQL thành công')
})


pool.on('error',()=>{
    console.log('Lỗi PostgreSQL: ',err)
})

export default pool 