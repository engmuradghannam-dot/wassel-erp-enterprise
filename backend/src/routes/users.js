const express  = require('express')
const router   = express.Router()
const bcrypt   = require('bcryptjs')
const User     = require('../models/User')
const { protect, authorize } = require('../middleware/auth')
const Audit    = require('../models/Audit')

const ROLES = ['admin','manager','accountant','hr_manager','sales','warehouse','cashier','employee','viewer']

router.get('/', protect, authorize('superadmin','admin','hr_manager'), async (req, res) => {
  try {
    const company = req.user.role === 'superadmin' ? (req.query.company || undefined) : (req.user.company?._id || req.user.company)
    const { search, role, department, isActive, page=1, limit=20 } = req.query
    const filter = {}
    if (company)    filter.company = company
    if (role)       filter.role = role
    if (department) filter.department = new RegExp(department, 'i')
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    if (search) filter.$or = [{ name:new RegExp(search,'i') }, { email:new RegExp(search,'i') }, { employeeId:new RegExp(search,'i') }]
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').populate('company','name').sort({ name:1 }).limit(+limit).skip((+page-1)*+limit),
      User.countDocuments(filter),
    ])
    res.json({ success:true, data:users, pagination:{ total, page:+page, pages:Math.ceil(total/+limit) } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

router.post('/', protect, authorize('superadmin','admin'), async (req, res) => {
  try {
    const { name, email, password, role, department, jobTitle, permissions } = req.body
    if (!name||!email||!password) return res.status(400).json({ success:false, message:'name, email, password required' })
    if (await User.findOne({ email })) return res.status(409).json({ success:false, message:'Email already exists' })
    const company = req.user.role === 'superadmin' ? (req.body.company || req.user.company?._id) : (req.user.company?._id || req.user.company)
    const user = await new User({ name, email, password, role:role||'employee', department, jobTitle, permissions:permissions||[], company, isVerified:true }).save()
    await Audit.create({ company, user:req.user._id, userName:req.user.name, action:'CREATE', module:'users', resource:'User', resourceId:user._id, message:`User created: ${name}` })
    res.status(201).json({ success:true, data:{ ...user.toObject(), password:undefined } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

router.put('/:id', protect, authorize('superadmin','admin'), async (req, res) => {
  try {
    const { password, ...rest } = req.body
    if (password) { rest.password = await bcrypt.hash(password, 14) }
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new:true }).select('-password')
    await Audit.create({ company: req.user.company?._id, user:req.user._id, userName:req.user.name, action:'UPDATE', module:'users', resource:'User', resourceId:user._id, message:`User updated: ${user.name}` })
    res.json({ success:true, data:user })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

router.delete('/:id', protect, authorize('superadmin','admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive:false })
    res.json({ success:true, message:'User deactivated' })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

module.exports = router
