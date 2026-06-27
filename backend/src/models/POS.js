const mongoose = require('mongoose')
const { Schema } = mongoose

const posSessionSchema = new Schema({
  company:      { type:Schema.Types.ObjectId, ref:'Company', required:true },
  cashier:      { type:Schema.Types.ObjectId, ref:'User', required:true },
  openingCash:  { type:Number, default:0 },
  closingCash:  { type:Number },
  expectedCash: { type:Number },
  cashDifference:{ type:Number },
  openedAt:     { type:Date, default:Date.now },
  closedAt:     { type:Date },
  status:       { type:String, enum:['open','closed'], default:'open' },
  notes:        { type:String },
}, { timestamps:true })
const POSSession = mongoose.model('POSSession', posSessionSchema)

const posItemSchema = new Schema({
  product:    { type:Schema.Types.ObjectId, ref:'Product' },
  name:       { type:String, required:true },
  sku:        { type:String },
  quantity:   { type:Number, required:true, min:0.001 },
  unitPrice:  { type:Number, required:true, min:0 },
  discount:   { type:Number, default:0 },
  taxRate:    { type:Number, default:15 },
  taxAmount:  { type:Number, default:0 },
  total:      { type:Number, default:0 },
}, { _id:true })

const posTransactionSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  session:     { type:Schema.Types.ObjectId, ref:'POSSession' },
  number:      { type:String },
  cashier:     { type:Schema.Types.ObjectId, ref:'User', required:true },
  customer:    { type:Schema.Types.ObjectId, ref:'Contact' },
  items:       [posItemSchema],
  subtotal:    { type:Number, default:0 },
  discount:    { type:Number, default:0 },
  taxAmount:   { type:Number, default:0 },
  total:       { type:Number, default:0 },
  tendered:    { type:Number, default:0 },
  change:      { type:Number, default:0 },
  payments:    [{ method:{ type:String, enum:['cash','card','transfer','voucher'] }, amount:Number, reference:String }],
  status:      { type:String, enum:['pending','paid','refunded','cancelled'], default:'paid' },
  notes:       { type:String },
  invoice:     { type:Schema.Types.ObjectId, ref:'Invoice' },
}, { timestamps:true })
posTransactionSchema.index({ company:1, createdAt:-1 })
posTransactionSchema.index({ company:1, session:1 })
const POSTransaction = mongoose.model('POSTransaction', posTransactionSchema)

module.exports = { POSSession, POSTransaction }
