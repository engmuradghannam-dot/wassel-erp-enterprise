const mongoose = require('mongoose')
const { Schema } = mongoose

// Product Category
const categorySchema = new Schema({
  company:   { type:Schema.Types.ObjectId, ref:'Company', required:true },
  name:      { type:String, required:true },
  nameEn:    { type:String },
  parent:    { type:Schema.Types.ObjectId, ref:'Category' },
  image:     { type:String },
  isActive:  { type:Boolean, default:true },
}, { timestamps:true })
const Category = mongoose.model('Category', categorySchema)

// Product
const productSchema = new Schema({
  company:       { type:Schema.Types.ObjectId, ref:'Company', required:true },
  name:          { type:String, required:true },
  nameEn:        { type:String },
  sku:           { type:String },
  barcode:       { type:String },
  description:   { type:String },
  category:      { type:Schema.Types.ObjectId, ref:'Category' },
  type:          { type:String, enum:['product','service','consumable','asset'], default:'product' },
  unit:          { type:String, default:'unit' },
  purchaseUnit:  { type:String },
  conversionRate:{ type:Number, default:1 },
  costPrice:     { type:Number, default:0, min:0 },
  salePrice:     { type:Number, default:0, min:0 },
  minSalePrice:  { type:Number, default:0 },
  taxRate:       { type:Number, default:15 },
  quantity:      { type:Number, default:0 },
  minStock:      { type:Number, default:0 },
  maxStock:      { type:Number, default:0 },
  reorderPoint:  { type:Number, default:0 },
  reorderQty:    { type:Number, default:0 },
  location:      { type:String },
  images:        [String],
  isActive:      { type:Boolean, default:true },
  isSold:        { type:Boolean, default:true },
  isPurchased:   { type:Boolean, default:true },
  vendor:        { type:Schema.Types.ObjectId, ref:'Vendor' },
  notes:         { type:String },
  tags:          [String],
  accountSale:   { type:Schema.Types.ObjectId, ref:'Account' },
  accountPurchase:{ type:Schema.Types.ObjectId, ref:'Account' },
  accountInventory:{ type:Schema.Types.ObjectId, ref:'Account' },
}, { timestamps:true })
productSchema.index({ company:1, sku:1 })
productSchema.index({ company:1, name:'text' })
const Product = mongoose.model('Product', productSchema)

// Stock Movement
const movementSchema = new Schema({
  company:    { type:Schema.Types.ObjectId, ref:'Company', required:true },
  product:    { type:Schema.Types.ObjectId, ref:'Product', required:true },
  type:       { type:String, enum:['in','out','transfer','adjustment','opening','return'], required:true },
  quantity:   { type:Number, required:true },
  unitCost:   { type:Number, default:0 },
  totalCost:  { type:Number, default:0 },
  quantityBefore:{ type:Number },
  quantityAfter: { type:Number },
  warehouseFrom: { type:String },
  warehouseTo:   { type:String },
  reference:  { type:String },
  refType:    { type:String, enum:['purchase','sale','transfer','adjustment','return','opening'] },
  refId:      { type:Schema.Types.ObjectId },
  date:       { type:Date, default:Date.now },
  notes:      { type:String },
  createdBy:  { type:Schema.Types.ObjectId, ref:'User' },
}, { timestamps:true })
movementSchema.index({ company:1, product:1 })
movementSchema.index({ company:1, date:-1 })
const StockMovement = mongoose.model('StockMovement', movementSchema)

module.exports = { Category, Product, StockMovement }
