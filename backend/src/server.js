'use strict'
const http        = require('http')
const express     = require('express')
const mongoose    = require('mongoose')
const cors        = require('cors')
const helmet      = require('helmet')
const compression = require('compression')
const morgan      = require('morgan')
const rateLimit   = require('express-rate-limit')
const cookieParser= require('cookie-parser')
const { Server }  = require('socket.io')
const path        = require('path')
require('dotenv').config()

const logger = require('./config/logger')
const app    = express()
const server = http.createServer(app)

// ── Socket.io real-time ────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', credentials: true }
})
app.set('io', io)
io.on('connection', socket => {
  socket.on('join', companyId => socket.join(`company:${companyId}`))
  socket.on('disconnect', () => {})
})

// ── Allowed CORS origins ───────────────────────────────────
const ALLOWED = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://wassel-erp-enterprise.vercel.app',
].filter(Boolean)

// ── Middleware ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: (o, cb) => (!o || ALLOWED.includes(o)) ? cb(null,true) : cb(new Error('CORS')), credentials: true }))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(morgan('combined', { stream: { write: m => logger.http(m.trim()) } }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rate limiters
const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders: true, legacyHeaders: false })
const authLimiter   = rateLimit({ windowMs: 15*60*1000, max: 20,  message: { success:false, message:'Too many auth attempts' } })
app.use(globalLimiter)

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',         authLimiter, require('./routes/auth'))
app.use('/api/companies',    require('./routes/companies'))
app.use('/api/users',        require('./routes/users'))
app.use('/api/dashboard',    require('./routes/dashboard'))
app.use('/api/accounting',   require('./routes/accounting'))
app.use('/api/hr',           require('./routes/hr'))
app.use('/api/projects',     require('./routes/projects'))
app.use('/api/crm',          require('./routes/crm'))
app.use('/api/inventory',    require('./routes/inventory'))
app.use('/api/purchasing',   require('./routes/purchasing'))
app.use('/api/pos',          require('./routes/pos'))
app.use('/api/contracts',    require('./routes/contracts'))
app.use('/api/notifications',require('./routes/notifications'))
app.use('/api/reports',      require('./routes/reports'))
app.use('/api/audit',        require('./routes/audit'))
app.use('/api/upload',       require('./routes/upload'))

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbState = ['disconnected','connected','connecting','disconnecting']
  res.json({
    success:   true,
    status:    'OK',
    version:   '2.0.0',
    env:       process.env.NODE_ENV,
    db:        dbState[mongoose.connection.readyState] || 'unknown',
    uptime:    Math.floor(process.uptime()) + 's',
    memory:    Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    timestamp: new Date().toISOString(),
    modules:   ['auth','companies','accounting','hr','projects','crm','inventory','purchasing','pos','contracts','notifications','reports'],
  })
})

// 404
app.use((req, res) => res.status(404).json({ success:false, message:'Route not found: ' + req.path }))

// Error handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} — ${err.message} — ${req.method} ${req.url}`)
  res.status(err.status || 500).json({ success:false, message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message })
})

// ── Connect DB & Start ─────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI
if (!MONGO_URI) { logger.error('MONGODB_URI not set'); process.exit(1) }

mongoose.connect(MONGO_URI, { maxPoolSize: 10 })
  .then(() => {
    logger.info('✅ MongoDB connected')
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => logger.info(`🚀 WasselERP Enterprise on port ${PORT} [${process.env.NODE_ENV}]`))
  })
  .catch(err => { logger.error('MongoDB error: ' + err.message); process.exit(1) })

// Graceful shutdown
process.on('SIGTERM', () => { server.close(() => mongoose.disconnect()) })
process.on('SIGINT',  () => { server.close(() => mongoose.disconnect()) })

module.exports = { app, io }
