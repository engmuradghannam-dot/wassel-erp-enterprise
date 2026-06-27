const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  company:   { type:mongoose.Schema.Types.ObjectId, ref:'Company', required:true },
  user:      { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  type:      { type:String, enum:['info','success','warning','error'], default:'info' },
  title:     { type:String, required:true },
  message:   { type:String, required:true },
  module:    { type:String },
  link:      { type:String },
  isRead:    { type:Boolean, default:false },
  readAt:    { type:Date },
  data:      { type:mongoose.Schema.Types.Mixed },
}, { timestamps:true })

notificationSchema.index({ user:1, isRead:1 })
notificationSchema.index({ company:1, createdAt:-1 })
notificationSchema.index({ createdAt:1 }, { expireAfterSeconds: 60*60*24*90 }) // 90 days

module.exports = mongoose.model('Notification', notificationSchema)
