const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const { Invoice, Payment } = require('../models/Accounting')
const { Employee, Leave, Payroll } = require('../models/HR')
const { Contact, Opportunity }     = require('../models/CRM')
const { Product, StockMovement }   = require('../models/Inventory')
const { PurchaseOrder }            = require('../models/Purchasing')
const { Project, Task }            = require('../models/Project')
const { Contract }                 = require('../models/Contract')
const { POSTransaction }           = require('../models/POS')
const Notification = require('../models/Notification')
const Audit        = require('../models/Audit')

router.get('/overview', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const now = new Date()
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startYear  = new Date(now.getFullYear(), 0, 1)

    const [
      // Finance
      revenueMonth, revenueYear, pendingInvoices, overdueInvoices,
      expensesMonth, payableAmount,
      // HR
      totalEmployees, activeEmployees, pendingLeaves, todayLeaves,
      // CRM
      totalCustomers, newLeads, openOpportunities,
      // Inventory
      lowStockProducts, totalProducts,
      // Projects
      activeProjects, overdueTasks,
      // POS
      posToday,
      // Contracts
      expiringContracts,
      // Notifications
      unreadNotifications,
    ] = await Promise.all([
      Invoice.aggregate([{ $match:{ company, type:'invoice', date:{ $gte:startMonth }, status:{ $ne:'cancelled' } } }, { $group:{ _id:null, total:{ $sum:'$total' } } }]),
      Invoice.aggregate([{ $match:{ company, type:'invoice', date:{ $gte:startYear }, status:{ $ne:'cancelled' } } }, { $group:{ _id:null, total:{ $sum:'$total' } } }]),
      Invoice.countDocuments({ company, type:'invoice', status:{ $in:['sent','partial'] } }),
      Invoice.countDocuments({ company, type:'invoice', status:'overdue' }),
      Invoice.aggregate([{ $match:{ company, type:'bill', date:{ $gte:startMonth }, status:{ $ne:'cancelled' } } }, { $group:{ _id:null, total:{ $sum:'$total' } } }]),
      Invoice.aggregate([{ $match:{ company, type:'bill', status:{ $in:['sent','partial','overdue'] } } }, { $group:{ _id:null, total:{ $sum:'$balance' } } }]),
      Employee.countDocuments({ company }),
      Employee.countDocuments({ company, status:'active' }),
      Leave.countDocuments({ company, status:'pending' }),
      Leave.countDocuments({ company, status:'approved', from:{ $lte:now }, to:{ $gte:now } }),
      Contact.countDocuments({ company, type:'customer' }),
      Contact.countDocuments({ company, type:'lead', createdAt:{ $gte:startMonth } }),
      Opportunity.countDocuments({ company, stage:{ $nin:['won','lost'] } }),
      Product.countDocuments({ company, $expr:{ $lte:['$quantity','$minStock'] }, quantity:{ $gt:0 } }),
      Product.countDocuments({ company, isActive:true }),
      Project.countDocuments({ company, status:'active' }),
      Task.countDocuments({ company, status:{ $nin:['done','cancelled'] }, dueDate:{ $lt:now } }),
      POSTransaction.aggregate([{ $match:{ company, createdAt:{ $gte:startMonth }, status:'paid' } }, { $group:{ _id:null, total:{ $sum:'$total' }, count:{ $sum:1 } } }]),
      Contract.countDocuments({ company, status:'active', endDate:{ $lte:new Date(Date.now() + 30*24*60*60*1000) } }),
      Notification.countDocuments({ user: req.user._id, isRead:false }),
    ])

    res.json({ success:true, data:{
      finance: {
        revenueThisMonth:  revenueMonth[0]?.total || 0,
        revenueThisYear:   revenueYear[0]?.total  || 0,
        expensesThisMonth: expensesMonth[0]?.total || 0,
        pendingInvoices,
        overdueInvoices,
        payableAmount:     payableAmount[0]?.total || 0,
      },
      hr: { totalEmployees, activeEmployees, pendingLeaves, todayLeaves },
      crm: { totalCustomers, newLeadsThisMonth: newLeads, openOpportunities },
      inventory: { lowStockProducts, totalProducts },
      projects: { activeProjects, overdueTasks },
      pos: { todayRevenue: posToday[0]?.total||0, todayTransactions: posToday[0]?.count||0 },
      contracts: { expiringContracts },
      notifications: { unread: unreadNotifications },
    }})
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// Monthly revenue chart (last 12 months)
router.get('/revenue-chart', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const months  = Array.from({ length:12 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (11-i)); return d
    })
    const data = await Promise.all(months.map(async m => {
      const start = new Date(m.getFullYear(), m.getMonth(), 1)
      const end   = new Date(m.getFullYear(), m.getMonth()+1, 0)
      const [rev, exp] = await Promise.all([
        Invoice.aggregate([{ $match:{ company, type:'invoice', date:{ $gte:start, $lte:end }, status:{ $ne:'cancelled' } } }, { $group:{ _id:null, t:{ $sum:'$total' } } }]),
        Invoice.aggregate([{ $match:{ company, type:'bill', date:{ $gte:start, $lte:end }, status:{ $ne:'cancelled' } } }, { $group:{ _id:null, t:{ $sum:'$total' } } }]),
      ])
      return {
        month:    m.toLocaleString('ar-SA', { month:'short' }),
        year:     m.getFullYear(),
        revenue:  rev[0]?.t || 0,
        expenses: exp[0]?.t || 0,
        profit:   (rev[0]?.t||0) - (exp[0]?.t||0),
      }
    }))
    res.json({ success:true, data })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// Recent activity
router.get('/activity', protect, async (req, res) => {
  try {
    const company = req.user.company?._id || req.user.company
    const activity = await Audit.find({ company }).sort({ createdAt:-1 }).limit(20).select('action module resource userName message createdAt')
    res.json({ success:true, data:activity })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

module.exports = router
