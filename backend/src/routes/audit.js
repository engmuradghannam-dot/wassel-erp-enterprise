const express = require('express')
const router  = express.Router()
const { protect, authorize } = require('../middleware/auth')
const Audit = require('../models/Audit')

router.get('/', protect, authorize('superadmin','admin'), async (req, res) => {
  try {
    const company = req.user.role === 'superadmin' ? undefined : (req.user.company?._id || req.user.company)
    const { page=1, limit=50, module, action, user, from, to } = req.query
    const filter = {}
    if (company) filter.company = company
    if (module)  filter.module  = module
    if (action)  filter.action  = action
    if (user)    filter.user    = user
    if (from||to) { filter.createdAt={}; if(from) filter.createdAt.$gte=new Date(from); if(to) filter.createdAt.$lte=new Date(to) }
    const [logs, total] = await Promise.all([
      Audit.find(filter).sort({ createdAt:-1 }).limit(+limit).skip((+page-1)*+limit).populate('user','name email'),
      Audit.countDocuments(filter),
    ])
    res.json({ success:true, data:logs, pagination:{ total, page:+page, pages:Math.ceil(total/+limit) } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

module.exports = router
