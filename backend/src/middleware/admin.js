const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được thực hiện thao tác này' })
    }
    next()
  }
  
  export { adminOnly }