const express    = require('express')
const router     = express.Router()
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const crypto     = require('crypto')
const https      = require('https')
const { body, validationResult } = require('express-validator')
const User       = require('../models/User')
const Company    = require('../models/Company')
const Audit      = require('../models/Audit')
const { protect } = require('../middleware/auth')
const logger     = require('../config/logger')

const sign = (userId, expiresIn) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' })

const sendToken = (res, user, statusCode = 200) => {
  const token = sign(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, language: user.language,
      theme: user.theme, company: user.company,
      department: user.department, jobTitle: user.jobTitle,
      permissions: user.permissions,
    }
  })
}

// ── Register Company ───────────────────────────────────────
router.post('/register-company', [
  body('companyName').notEmpty().trim().isLength({ min:2, max:100 }),
  body('adminName').notEmpty().trim().isLength({ min:2, max:100 }),
  body('adminEmail').isEmail().normalizeEmail(),
  body('adminPassword').isLength({ min:8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() })
  try {
    const { companyName, companyEmail, adminName, adminEmail, adminPassword, language, currency, country, industry } = req.body
    if (await User.findOne({ email: adminEmail }))
      return res.status(409).json({ success:false, message:'Email already registered' })
    const company = await new Company({
      name: companyName, email: companyEmail, language: language || 'ar',
      currency: currency || 'SAR', country: country || 'SA', industry,
    }).save()
    const admin = await new User({
      name: adminName, email: adminEmail, password: adminPassword,
      role: 'admin', company: company._id, language: language || 'ar', isVerified: true,
    }).save()
    await Audit.create({ company: company._id, user: admin._id, userName: admin.name, action:'CREATE', module:'auth', resource:'Company', message:`Company registered: ${companyName}` })
    const populated = await User.findById(admin._id).populate('company','name logo currency language')
    sendToken(res, populated, 201)
  } catch(err) { logger.error('Register error: ' + err.message); res.status(500).json({ success:false, message: err.message }) }
})

// ── Login ──────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success:false, message:'Invalid email or password' })
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
      .populate('company','name logo currency language timezone isActive subscription')
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success:false, message:'Invalid email or password' })
    if (!user.isActive) return res.status(403).json({ success:false, message:'Account deactivated. Contact admin.' })
    if (user.company && !user.company.isActive) return res.status(403).json({ success:false, message:'Company account suspended.' })
    user.lastLogin   = new Date()
    user.lastLoginIp = req.ip
    user.loginCount  = (user.loginCount || 0) + 1
    await user.save()
    await Audit.create({ company: user.company?._id, user: user._id, userName: user.name, action:'LOGIN', module:'auth', ipAddress: req.ip, userAgent: req.headers['user-agent'] })
    sendToken(res, user)
  } catch(err) { logger.error('Login error: ' + err.message); res.status(500).json({ success:false, message: err.message }) }
})

// ── Google OAuth ───────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ success:false, message:'Google credential required' })
    const tokenInfo = await new Promise((resolve, reject) => {
      https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, r => {
        let d = ''
        r.on('data', c => d += c)
        r.on('end', () => { try { const p = JSON.parse(d); p.error ? reject(new Error(p.error)) : resolve(p) } catch { reject(new Error('Invalid response')) } })
      }).on('error', reject)
    })
    const { email, name, picture, sub: googleId, email_verified } = tokenInfo
    if (!email_verified) return res.status(401).json({ success:false, message:'Google email not verified' })
    let user = await User.findOne({ email }).populate('company','name logo currency language')
    if (user) {
      if (!user.googleId) { user.googleId = googleId; await user.save() }
    } else {
      const company = await new Company({ name: name + "'s Company", email, language:'ar', currency:'SAR' }).save()
      user = await new User({ name, email, password: crypto.randomBytes(32).toString('hex'), avatar: picture||'', googleId, company: company._id, isVerified:true, role:'admin' }).save()
      user = await User.findById(user._id).populate('company','name logo currency language')
    }
    user.lastLogin = new Date(); await user.save()
    sendToken(res, user)
  } catch(err) { logger.error('Google auth: ' + err.message); res.status(500).json({ success:false, message:'Google authentication failed' }) }
})

// ── Get Me ─────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success:true, data: {
    id: req.user._id, name: req.user.name, email: req.user.email,
    role: req.user.role, avatar: req.user.avatar, language: req.user.language,
    theme: req.user.theme, company: req.user.company,
    department: req.user.department, jobTitle: req.user.jobTitle,
    permissions: req.user.permissions, lastLogin: req.user.lastLogin,
  }})
})

// ── Update Profile ─────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name','phone','language','theme','avatar','jobTitle','department','notificationPrefs']
    const updates = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new:true, runValidators:true })
      .populate('company','name logo currency language')
    res.json({ success:true, data: user })
  } catch(err) { res.status(500).json({ success:false, message: err.message }) }
})

// ── Change Password ────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ success:false, message:'Both passwords required' })
    if (newPassword.length < 8) return res.status(400).json({ success:false, message:'Password must be at least 8 characters' })
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ success:false, message:'Current password incorrect' })
    user.password = newPassword; await user.save()
    await Audit.create({ company: req.user.company?._id, user: req.user._id, userName: req.user.name, action:'UPDATE', module:'auth', resource:'Password', message:'Password changed' })
    res.json({ success:true, message:'Password changed successfully' })
  } catch(err) { res.status(500).json({ success:false, message: err.message }) }
})

// ── Forgot Password ────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const MSG = 'If this email is registered, a reset link has been sent.'
    if (!email) return res.status(400).json({ success:false, message:'Email required' })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.json({ success:true, message:MSG })
    const token     = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    user.passwordResetToken   = tokenHash
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save({ validateBeforeSave:false })
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const nodemailer = require('nodemailer')
      const t = nodemailer.createTransport({ host:process.env.EMAIL_HOST, port:+process.env.EMAIL_PORT, secure:false, auth:{ user:process.env.EMAIL_USER, pass:process.env.EMAIL_PASS } })
      await t.sendMail({
        from:`"${process.env.EMAIL_FROM_NAME||'WasselERP'}" <${process.env.EMAIL_FROM_ADDR||process.env.EMAIL_USER}>`,
        to:email, subject:'Password Reset — WasselERP',
        html:`<div dir="rtl" style="font-family:Arial;max-width:600px;margin:auto">
          <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:24px;border-radius:12px 12px 0 0;text-align:center"><h2 style="color:#fff;margin:0">🏢 WasselERP</h2></div>
          <div style="background:#fff;padding:28px;border:1px solid #e5e7eb">
            <h3>مرحباً ${user.name} 👋</h3>
            <p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
            <div style="text-align:center;margin:24px 0"><a href="${resetURL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;border-radius:10px;text-decoration:none;font-weight:700">🔑 إعادة تعيين كلمة المرور</a></div>
            <p style="color:#9ca3af;font-size:13px">⏰ صالح لساعة واحدة فقط.</p>
          </div>
        </div>`,
      })
    }
    res.json({ success:true, message:MSG })
  } catch(err) { logger.error('Forgot password: ' + err.message); res.status(500).json({ success:false, message:'Failed to process request' }) }
})

// ── Reset Password ─────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body
    if (!token || !email || !newPassword) return res.status(400).json({ success:false, message:'All fields required' })
    if (newPassword.length < 8) return res.status(400).json({ success:false, message:'Password must be at least 8 characters' })
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ email:email.toLowerCase(), passwordResetToken:tokenHash, passwordResetExpires:{ $gt:new Date() } })
    if (!user) return res.status(400).json({ success:false, message:'Invalid or expired reset link' })
    user.password             = newPassword
    user.passwordResetToken   = undefined
    user.passwordResetExpires = undefined
    await user.save()
    res.json({ success:true, message:'Password reset successfully. You can now sign in.' })
  } catch(err) { res.status(500).json({ success:false, message: err.message }) }
})

// ── Setup SuperAdmin (one-time) ────────────────────────────
router.post('/setup', async (req, res) => {
  try {
    if (await User.findOne({ role:'superadmin' }))
      return res.status(400).json({ success:false, message:'SuperAdmin already exists' })
    const { name, email, password, secret } = req.body
    if (secret !== process.env.ADMIN_SECRET) return res.status(403).json({ success:false, message:'Invalid secret' })
    const sa = await new User({ name, email, password, role:'superadmin', isVerified:true }).save()
    sendToken(res, sa, 201)
  } catch(err) { res.status(500).json({ success:false, message: err.message }) }
})

module.exports = router
