const jwt    = require('jsonwebtoken')
const User   = require('../models/User')
const logger = require('../config/logger')

// ── Verify JWT ─────────────────────────────────────────────
const protect = async (req, res, next) => {
  const auth  = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : req.cookies?.token
  if (!token) return res.status(401).json({ success:false, message:'Authentication required' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.userId)
      .select('-password')
      .populate('company', 'name logo currency language timezone isActive subscription')
    if (!user)        return res.status(401).json({ success:false, message:'User not found' })
    if (!user.isActive) return res.status(403).json({ success:false, message:'Account deactivated' })
    if (user.company && !user.company.isActive)
      return res.status(403).json({ success:false, message:'Company account suspended' })
    req.user = user
    next()
  } catch (err) {
    logger.warn('Invalid token: ' + err.message)
    return res.status(401).json({ success:false, message:'Invalid or expired token' })
  }
}

// ── Role-based access ──────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success:false, message:`Access denied. Required: [${roles.join(', ')}]` })
  next()
}

// ── Company isolation ──────────────────────────────────────
const sameCompany = (req, res, next) => {
  if (req.user.role === 'superadmin') return next()
  const cid = req.params.companyId || req.body.company
  if (cid && cid.toString() !== req.user.company?._id?.toString())
    return res.status(403).json({ success:false, message:'Access denied to this company data' })
  next()
}

// ── Permission check (granular) ────────────────────────────
const hasPermission = (module, action) => (req, res, next) => {
  const { role, permissions } = req.user
  if (role === 'superadmin' || role === 'admin') return next()
  const key = `${module}:${action}`
  if (permissions?.includes(key) || permissions?.includes(`${module}:*`) || permissions?.includes('*'))
    return next()
  return res.status(403).json({ success:false, message:`Permission denied: ${key}` })
}

// ── Optional auth (public endpoints that need user if logged in) ──
const optionalAuth = async (req, res, next) => {
  const auth  = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : null
  if (!token) return next()
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.userId).select('-password')
  } catch {}
  next()
}

module.exports = { protect, authorize, sameCompany, hasPermission, optionalAuth }
