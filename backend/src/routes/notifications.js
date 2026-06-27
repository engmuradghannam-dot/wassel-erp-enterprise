const express      = require('express')
const router       = express.Router()
const { protect }  = require('../middleware/auth')
const Notification = require('../models/Notification')

// Get notifications
router.get('/', protect, async (req, res) => {
  try {
    const { page=1, limit=20, unreadOnly } = req.query
    const filter = { user: req.user._id }
    if (unreadOnly === 'true') filter.isRead = false
    const [notifications, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt:-1 }).limit(+limit).skip((+page-1)*+limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead:false }),
    ])
    res.json({ success:true, data:notifications, pagination:{ total, page:+page }, unread })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// Mark as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id:req.params.id, user:req.user._id }, { isRead:true, readAt:new Date() })
    res.json({ success:true })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user:req.user._id, isRead:false }, { isRead:true, readAt:new Date() })
    res.json({ success:true })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

// Unread count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user:req.user._id, isRead:false })
    res.json({ success:true, count })
  } catch(err) { res.status(500).json({ success:false, message:err.message }) }
})

module.exports = router
