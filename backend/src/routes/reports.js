const express  = require('express')
const router   = express.Router()
const { protect } = require('../middleware/auth')
const { Invoice } = require('../models/Accounting')
const { Employee, Payroll } = require('../models/HR')

// Financial Summary
router.get('/financial-summary', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const { year = new Date().getFullYear() } = req.query
    const start = new Date(year, 0, 1)
    const end   = new Date(year, 11, 31)
    const [revenue, expenses] = await Promise.all([
      Invoice.aggregate([{ $match:{ company, type:'invoice', date:{ $gte:start, $lte:end }, status:{ $ne:'cancelled' } } }, { $group:{ _id:{ month:{ $month:'$date' } }, total:{ $sum:'$total' }, count:{ $sum:1 } } }]),
      Invoice.aggregate([{ $match:{ company, type:'bill', date:{ $gte:start, $lte:end }, status:{ $ne:'cancelled' } } }, { $group:{ _id:{ month:{ $month:'$date' } }, total:{ $sum:'$total' }, count:{ $sum:1 } } }]),
    ])
    res.json({ success:true, data:{ year:+year, revenue, expenses } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// Payroll Summary
router.get('/payroll-summary', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const { year = new Date().getFullYear(), month } = req.query
    const filter = { company, year:+year }
    if (month) filter.month = +month
    const payroll = await Payroll.find(filter).populate('employee','name department jobTitle').sort({ month:1 })
    const summary = payroll.reduce((acc, p) => ({ ...acc, totalGross:(acc.totalGross||0)+p.grossSalary, totalNet:(acc.totalNet||0)+p.netSalary, totalDeductions:(acc.totalDeductions||0)+p.totalDeductions }), {})
    res.json({ success:true, data:{ payroll, summary } })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

module.exports = router
