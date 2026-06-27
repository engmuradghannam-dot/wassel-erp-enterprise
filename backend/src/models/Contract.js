const mongoose = require('mongoose')
const { Schema } = mongoose

const contractSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  number:      { type:String },
  title:       { type:String, required:true },
  type:        { type:String, enum:['service','supply','employment','lease','maintenance','consulting','partnership','nda','other'], default:'other' },
  parties: [{
    name:     { type:String, required:true },
    role:     { type:String, enum:['client','vendor','employee','partner'] },
    contact:  { type:Schema.Types.ObjectId, ref:'Contact' },
    email:    { type:String },
    signed:   { type:Boolean, default:false },
    signedAt: { type:Date },
    signature:{ type:String },
  }],
  startDate:   { type:Date, required:true },
  endDate:     { type:Date },
  value:       { type:Number, default:0 },
  currency:    { type:String, default:'SAR' },
  paymentTerms:{ type:String },
  description: { type:String },
  content:     { type:String }, // Rich text contract body
  status:      { type:String, enum:['draft','review','active','expired','terminated','renewed'], default:'draft' },
  autoRenew:   { type:Boolean, default:false },
  renewalNotice:{ type:Number, default:30 }, // days before expiry
  reminderDays:[{ type:Number }],
  lastReminded:{ type:Date },
  attachments: [{ name:String, url:String, size:Number }],
  tags:        [String],
  notes:       { type:String },
  assignedTo:  { type:Schema.Types.ObjectId, ref:'User' },
  approvedBy:  { type:Schema.Types.ObjectId, ref:'User' },
  terminatedAt:{ type:Date },
  terminationReason:{ type:String },
  createdBy:   { type:Schema.Types.ObjectId, ref:'User' },
}, { timestamps:true })
contractSchema.index({ company:1, status:1 })
contractSchema.index({ company:1, endDate:1 })
const Contract = mongoose.model('Contract', contractSchema)

module.exports = { Contract }
