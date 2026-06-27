const express  = require('express')
const router   = express.Router()
const { protect, authorize } = require('../middleware/auth')
const Model    = require('../models/Accounting')
const Audit    = require('../models/Audit')

// GET all
router.get('/', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const { page=1, limit=20, search, status, sort='-createdAt' } = req.query
    const filter = { company }
    if (status) filter.status = status
    if (search) filter.$or = [{ name: new RegExp(search,'i') }, { title: new RegExp(search,'i') }, { number: new RegExp(search,'i') }].filter(f => Object.values(f)[0] !== undefined)
    
    const [docs, total] = await Promise.all([
      Model.find(filter).populate('customer vendor createdBy').sort(sort).limit(+limit).skip((+page-1)*+limit),
      Model.countDocuments(filter),
    ])
    res.json({ success:true, data:docs, pagination:{ total, page:+page, pages:Math.ceil(total/+limit) } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// GET one
router.get('/:id', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const doc = await Model.findOne({ _id:req.params.id, company }).populate('customer vendor createdBy')
    if (!doc) return res.status(404).json({ success:false, message:'Invoice not found' })
    res.json({ success:true, data:doc })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// CREATE
router.post('/', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const count   = await Model.countDocuments({ company })
    const doc = await new Model({ ...req.body, company, createdBy:req.user._id }).save()
    await Audit.create({ company, user:req.user._id, userName:req.user.name, action:'CREATE', module:'Invoice', resource:'Invoice', resourceId:doc._id, message:`Created Invoice: ${doc.name||doc.title||doc.number||doc._id}` })
    res.status(201).json({ success:true, data:doc })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// UPDATE
router.put('/:id', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const before  = await Model.findOne({ _id:req.params.id, company })
    if (!before) return res.status(404).json({ success:false, message:'Not found' })
    const doc = await Model.findOneAndUpdate({ _id:req.params.id, company }, req.body, { new:true, runValidators:true })
    await Audit.create({ company, user:req.user._id, userName:req.user.name, action:'UPDATE', module:'Invoice', resource:'Invoice', resourceId:doc._id, changes:{ before:before.toObject(), after:doc.toObject() } })
    res.json({ success:true, data:doc })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// DELETE
router.delete('/:id', protect, authorize('superadmin','admin','manager'), async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const doc = await Model.findOneAndDelete({ _id:req.params.id, company })
    if (!doc) return res.status(404).json({ success:false, message:'Not found' })
    await Audit.create({ company, user:req.user._id, userName:req.user.name, action:'DELETE', module:'Invoice', resource:'Invoice', resourceId:doc._id })
    res.json({ success:true, message:'Invoice deleted' })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

module.exports = router
