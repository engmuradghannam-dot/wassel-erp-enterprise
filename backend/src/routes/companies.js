const express   = require('express')
const router    = express.Router()
const Company   = require('../models/Company')
const User      = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

router.get('/', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { page=1, limit=20, search, status } = req.query
    const filter = {}
    if (search) filter.name = new RegExp(search, 'i')
    if (status === 'active')   filter.isActive = true
    if (status === 'inactive') filter.isActive = false
    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt:-1 }).limit(+limit).skip((+page-1)*+limit),
      Company.countDocuments(filter),
    ])
    res.json({ success:true, data:companies, pagination:{ total, page:+page, pages:Math.ceil(total/+limit) } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

router.get('/mine', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.user.company?._id || req.user.company)
    if (!company) return res.status(404).json({ success:false, message:'Company not found' })
    res.json({ success:true, data:company })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

router.put('/:id', protect, authorize('superadmin','admin'), async (req, res) => {
  try {
    const allowed = ['name','nameEn','logo','email','phone','website','address','taxNumber','vatNumber','crNumber','industry','size','currency','language','timezone','dateFormat','settings','socialLinks']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const company = await Company.findByIdAndUpdate(req.params.id, updates, { new:true, runValidators:true })
    res.json({ success:true, data:company })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

router.get('/:id/stats', protect, async (req, res) => {
  try {
    const company = req.params.id
    const [users, modules] = await Promise.all([
      User.countDocuments({ company, isActive:true }),
      Company.findById(company).select('modules subscription trialEndsAt'),
    ])
    res.json({ success:true, data:{ users, ...modules?.toObject() } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

module.exports = router
