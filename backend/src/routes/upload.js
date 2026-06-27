const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const path    = require('path')
const { protect } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g,'_'))
})
const upload = multer({ storage, limits:{ fileSize: 10*1024*1024 }, fileFilter:(req,file,cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv/
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()))
}})

router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success:false, message:'No file uploaded' })
  res.json({ success:true, data:{ filename:req.file.filename, originalname:req.file.originalname, size:req.file.size, url:`/uploads/${req.file.filename}` } })
})

router.post('/multiple', protect, upload.array('files', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success:false, message:'No files uploaded' })
  res.json({ success:true, data: req.files.map(f => ({ filename:f.filename, originalname:f.originalname, size:f.size, url:`/uploads/${f.filename}` })) })
})

module.exports = router
