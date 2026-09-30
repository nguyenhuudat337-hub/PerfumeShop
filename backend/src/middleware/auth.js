import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'

const protect = async (req,res,next) =>{
    let token 
    //dấu ? thể hiện authorization tồn tại mới gọi startsWith
    if (req.headers.authorization?.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1] //"Bearer vkjebavukjer" thì split thành ["Bearer","ehtrdenb"]
            const decoded = jwt.verify(token,process.env.JWT_SECRET) //trả về payload nếu token hợp lệ
            //Lấy user theo id
            const result = await pool.query('SELECT id,name,email,role FROM users WHERE id = $1',[decoded.userId]) //[decoded.userId] truyền vào $1
            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'User không tồn tại' })
            }
        
            req.user = result.rows[0]
            next()
        }catch(error){
            return res.status(401).json({message: 'Token không hợp lệ'})
        }
    }else{
        return res.status(401).json({message: 'Không có token, truy cập bị từ chối'})
    }
}


export { protect }
