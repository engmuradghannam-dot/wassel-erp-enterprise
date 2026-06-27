const mongoose = require('mongoose')

const auditSchema = new mongoose.Schema({
  company:    { type:mongoose.Schema.Types.ObjectId, ref:'Company', required:true },
  user:       { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  userName:   { type:String },
  action:     { type:String, required:true },  // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT
  module:     { type:String, required:true },  // accounting, hr, inventory, etc
  resource:   { type:String },                 // Invoice, Employee, etc
  resourceId: { type:mongoose.Schema.Types.ObjectId },
  changes:    { before:mongoose.Schema.Types.Mixed, after:mongoose.Schema.Types.Mixed },
  ipAddress:  { type:String },
  userAgent:  { type:String },
  status:     { type:String, enum:['success','failure'], default:'success' },
  message:    { type:String },
}, { timestamps:true })

auditSchema.index({ company:1, createdAt:-1 })
auditSchema.index({ company:1, module:1 })
auditSchema.index({ company:1, user:1 })
auditSchema.index({ createdAt:1 }, { expireAfterSeconds: 60*60*24*365 }) // Auto-delete after 1 year

module.exports = mongoose.model('Audit', auditSchema)
