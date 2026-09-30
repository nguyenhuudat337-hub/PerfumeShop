import axios from 'axios' //thư viện JavaScript dùng để gửi HTTP request từ Frontend đến Backend và nhận response trả về


const api = axios.create({
    baseURL: 'http://localhost:5002/api',
})


//mỗi khi api chuẩn bị gửi 1 request, hãy chạy đoạn code này trước
api.interceptors.request.use((config)=>{
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user?.token){
        config.headers.Authorization = `Bearer ${user.token}`
    }
    return config 
})

export default api 