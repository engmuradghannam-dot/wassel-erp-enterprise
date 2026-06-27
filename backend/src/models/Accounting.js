const mongoose = require('mongoose')
const { Schema } = mongoose

// Chart of Accounts
const accountSchema = new Schema({
  company:    { type:Schema.Types.ObjectId, ref:'Company', required:true },
  code:       { type:String, required:true },
  name:       { type:String, required:true },
  nameEn:     { type:String },
  type:       { type:String, enum:['asset','liability','equity','revenue','expense','contra'], required:true },
  subtype:    { type:String }, // cash, bank, receivable, payable, etc
  parentCode: { type:String },
  level:      { type:Number, default:1 },
  currency:   { type:String, default:'SAR' },
  isActive:   { type:Boolean, default:true },
  isSystem:   { type:Boolean, default:false }, // Cannot be deleted
  balance:    { type:Number, default:0 },
  notes:      { type:String },
  tags:       [String],
}, { timestamps:true })
accountSchema.index({ company:1, code:1 }, { unique:true })
const Account = mongoose.model('Account', accountSchema)

// Journal Entry
const journalLineSchema = new Schema({
  account:    { type:Schema.Types.ObjectId, ref:'Account', required:true },
  description:{ type:String },
  debit:      { type:Number, default:0, min:0 },
  credit:     { type:Number, default:0, min:0 },
  costCenter: { type:String },
  project:    { type:Schema.Types.ObjectId, ref:'Project' },
}, { _id:true })

const journalSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  number:      { type:String },
  date:        { type:Date, required:true },
  description: { type:String, required:true },
  reference:   { type:String },
  type:        { type:String, enum:['manual','invoice','payment','receipt','payroll','depreciation','opening','closing','adjustment'], default:'manual' },
  status:      { type:String, enum:['draft','posted','cancelled'], default:'draft' },
  lines:       [journalLineSchema],
  totalDebit:  { type:Number, default:0 },
  totalCredit: { type:Number, default:0 },
  attachments: [{ name:String, url:String, size:Number }],
  notes:       { type:String },
  postedAt:    { type:Date },
  postedBy:    { type:Schema.Types.ObjectId, ref:'User' },
  createdBy:   { type:Schema.Types.ObjectId, ref:'User' },
  isRecurring: { type:Boolean, default:false },
  recurringInterval: { type:String, enum:['daily','weekly','monthly','quarterly','yearly'] },
}, { timestamps:true })
journalSchema.index({ company:1, date:-1 })
journalSchema.index({ company:1, status:1 })
const Journal = mongoose.model('Journal', journalSchema)

// Invoice / Bill
const invoiceLineSchema = new Schema({
  description: { type:String, required:true },
  quantity:    { type:Number, default:1, min:0 },
  unitPrice:   { type:Number, default:0, min:0 },
  unit:        { type:String, default:'unit' },
  discount:    { type:Number, default:0, min:0, max:100 }, // percentage
  taxRate:     { type:Number, default:15, min:0 }, // VAT %
  taxAmount:   { type:Number, default:0 },
  subtotal:    { type:Number, default:0 },
  total:       { type:Number, default:0 },
  account:     { type:Schema.Types.ObjectId, ref:'Account' },
  product:     { type:Schema.Types.ObjectId, ref:'Product' },
}, { _id:true })

const invoiceSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  number:      { type:String },
  type:        { type:String, enum:['invoice','bill','credit_note','debit_note','proforma','quote'], default:'invoice' },
  customer:    { type:Schema.Types.ObjectId, ref:'Contact' },
  vendor:      { type:Schema.Types.ObjectId, ref:'Vendor' },
  date:        { type:Date, required:true },
  dueDate:     { type:Date },
  deliveryDate:{ type:Date },
  lines:       [invoiceLineSchema],
  subtotal:    { type:Number, default:0 },
  totalDiscount:{ type:Number, default:0 },
  taxAmount:   { type:Number, default:0 },
  total:       { type:Number, default:0 },
  paid:        { type:Number, default:0 },
  balance:     { type:Number, default:0 },
  currency:    { type:String, default:'SAR' },
  exchangeRate:{ type:Number, default:1 },
  status:      { type:String, enum:['draft','sent','partial','paid','overdue','cancelled','refunded'], default:'draft' },
  paymentTerms:{ type:String },
  paymentMethod:{ type:String },
  bankAccount: { type:String },
  notes:       { type:String },
  termsAndConditions:{ type:String },
  attachments: [{ name:String, url:String }],
  zatcaQR:     { type:String }, // ZATCA QR code
  zatcaHash:   { type:String }, // ZATCA cryptographic hash
  sentAt:      { type:Date },
  paidAt:      { type:Date },
  journal:     { type:Schema.Types.ObjectId, ref:'Journal' },
  createdBy:   { type:Schema.Types.ObjectId, ref:'User' },
}, { timestamps:true })
invoiceSchema.index({ company:1, type:1, status:1 })
invoiceSchema.index({ company:1, date:-1 })
invoiceSchema.index({ company:1, dueDate:1, status:1 })
const Invoice = mongoose.model('Invoice', invoiceSchema)

// Payment
const paymentSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  number:      { type:String },
  type:        { type:String, enum:['receipt','payment'], required:true },
  contact:     { type:Schema.Types.ObjectId, ref:'Contact' },
  date:        { type:Date, required:true },
  amount:      { type:Number, required:true, min:0 },
  currency:    { type:String, default:'SAR' },
  method:      { type:String, enum:['cash','bank','cheque','card','transfer','other'], required:true },
  reference:   { type:String },
  bankAccount: { type:String },
  invoices:    [{ invoice:{ type:Schema.Types.ObjectId, ref:'Invoice' }, amount:Number }],
  notes:       { type:String },
  status:      { type:String, enum:['pending','confirmed','cancelled'], default:'confirmed' },
  journal:     { type:Schema.Types.ObjectId, ref:'Journal' },
  createdBy:   { type:Schema.Types.ObjectId, ref:'User' },
}, { timestamps:true })
const Payment = mongoose.model('Payment', paymentSchema)

module.exports = { Account, Journal, Invoice, Payment }
