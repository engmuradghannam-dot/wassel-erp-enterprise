const mongoose = require('mongoose')
const { Schema } = mongoose

// Vendor
const vendorSchema = new Schema({
  company:    { type:Schema.Types.ObjectId, ref:'Company', required:true },
  name:       { type:String, required:true },
  nameEn:     { type:String },
  email:      { type:String, lowercase:true },
  phone:      { type:String },
  mobile:     { type:String },
  contactPerson:{ type:String },
  website:    { type:String },
  taxNumber:  { type:String },
  vatNumber:  { type:String },
  address:    { street:String, city:String, country:{ type:String, default:'SA' } },
  currency:   { type:String, default:'SAR' },
  paymentTerms:{ type:String, default:'30' },
  bankName:   { type:String },
  bankAccount:{ type:String },
  bankIban:   { type:String },
  creditLimit:{ type:Number, default:0 },
  rating:     { type:Number, min:1, max:5 },
  isActive:   { type:Boolean, default:true },
  notes:      { type:String },
  tags:       [String],
}, { timestamps:true })
const Vendor = mongoose.model('Vendor', vendorSchema)

// Purchase Order
const poLineSchema = new Schema({
  product:    { type:Schema.Types.ObjectId, ref:'Product' },
  description:{ type:String, required:true },
  quantity:   { type:Number, required:true, min:0 },
  unit:       { type:String },
  unitPrice:  { type:Number, required:true, min:0 },
  discount:   { type:Number, default:0 },
  taxRate:    { type:Number, default:15 },
  taxAmount:  { type:Number, default:0 },
  total:      { type:Number, default:0 },
  received:   { type:Number, default:0 },
  account:    { type:Schema.Types.ObjectId, ref:'Account' },
}, { _id:true })

const purchaseOrderSchema = new Schema({
  company:    { type:Schema.Types.ObjectId, ref:'Company', required:true },
  number:     { type:String },
  vendor:     { type:Schema.Types.ObjectId, ref:'Vendor', required:true },
  date:       { type:Date, required:true },
  expectedDate:{ type:Date },
  lines:      [poLineSchema],
  subtotal:   { type:Number, default:0 },
  taxAmount:  { type:Number, default:0 },
  discount:   { type:Number, default:0 },
  shipping:   { type:Number, default:0 },
  total:      { type:Number, default:0 },
  currency:   { type:String, default:'SAR' },
  status:     { type:String, enum:['draft','sent','partial','received','billed','cancelled'], default:'draft' },
  paymentTerms:{ type:String },
  shippingAddress:{ type:String },
  notes:      { type:String },
  attachments:[{ name:String, url:String }],
  approvedBy: { type:Schema.Types.ObjectId, ref:'User' },
  approvedAt: { type:Date },
  createdBy:  { type:Schema.Types.ObjectId, ref:'User' },
  invoice:    { type:Schema.Types.ObjectId, ref:'Invoice' },
}, { timestamps:true })
purchaseOrderSchema.index({ company:1, status:1 })
purchaseOrderSchema.index({ company:1, vendor:1 })
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema)

module.exports = { Vendor, PurchaseOrder }
