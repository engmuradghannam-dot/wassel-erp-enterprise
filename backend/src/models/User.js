const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const ROLES = ['superadmin','admin','manager','accountant','hr_manager','sales','warehouse','cashier','employee','viewer']

const permissionSchema = new mongoose.Schema({ module:String, actions:[String] }, { _id:false })

const userSchema = new mongoose.Schema({
  name:        { type:String, required:true, trim:true },
  nameEn:      { type:String, trim:true },
  email:       { type:String, required:true, unique:true, lowercase:true, trim:true },
  password:    { type:String, required:true, select:false, minlength:8 },
  phone:       { type:String },
  avatar:      { type:String, default:'' },
  role:        { type:String, enum:ROLES, default:'employee' },
  permissions: [{ type:String }],
  company:     { type:mongoose.Schema.Types.ObjectId, ref:'Company' },
  department:  { type:String },
  jobTitle:    { type:String },
  employeeId:  { type:String },
  language:    { type:String, default:'ar' },
  theme:       { type:String, enum:['light','dark','system'], default:'light' },
  googleId:    { type:String },
  isActive:    { type:Boolean, default:true },
  isVerified:  { type:Boolean, default:false },
  lastLogin:   { type:Date },
  lastLoginIp: { type:String },
  loginCount:  { type:Number, default:0 },
  passwordChangedAt: { type:Date },
  passwordResetToken:{ type:String },
  passwordResetExpires:{ type:Date },
  twoFactorEnabled: { type:Boolean, default:false },
  twoFactorSecret:  { type:String },
  notificationPrefs: {
    email:   { type:Boolean, default:true },
    browser: { type:Boolean, default:true },
    invoice: { type:Boolean, default:true },
    payroll: { type:Boolean, default:true },
    leave:   { type:Boolean, default:true },
  },
}, { timestamps:true, toJSON:{ virtuals:true } })

userSchema.index({ email:1 })
userSchema.index({ company:1, role:1 })
userSchema.index({ company:1, isActive:1 })

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 14)
  this.passwordChangedAt = new Date()
  next()
})

// Compare passwords
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Check if password changed after JWT issued
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > jwtTimestamp
  }
  return false
}

module.exports = mongoose.model('User', userSchema)
