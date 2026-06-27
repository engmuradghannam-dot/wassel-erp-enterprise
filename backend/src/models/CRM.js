const mongoose = require('mongoose')
const { Schema } = mongoose

// Contact (Customers + Leads)
const contactSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  type:        { type:String, enum:['lead','customer','prospect','partner'], default:'lead' },
  name:        { type:String, required:true },
  nameEn:      { type:String },
  email:       { type:String, lowercase:true },
  phone:       { type:String },
  mobile:      { type:String },
  companyName: { type:String },
  jobTitle:    { type:String },
  website:     { type:String },
  industry:    { type:String },
  address:     { street:String, city:String, country:{ type:String, default:'SA' } },
  taxNumber:   { type:String },
  creditLimit: { type:Number, default:0 },
  paymentTerms:{ type:String, default:'30' },
  currency:    { type:String, default:'SAR' },
  source:      { type:String, enum:['website','referral','social','email','phone','exhibition','other'] },
  assignedTo:  { type:Schema.Types.ObjectId, ref:'User' },
  tags:        [String],
  notes:       { type:String },
  isActive:    { type:Boolean, default:true },
  lastContact: { type:Date },
  totalSales:  { type:Number, default:0 },
  outstanding: { type:Number, default:0 },
  avatar:      { type:String },
}, { timestamps:true })
contactSchema.index({ company:1, type:1 })
contactSchema.index({ company:1, email:1 })
const Contact = mongoose.model('Contact', contactSchema)

// Opportunity / Deal
const opportunitySchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  title:       { type:String, required:true },
  contact:     { type:Schema.Types.ObjectId, ref:'Contact' },
  value:       { type:Number, default:0 },
  currency:    { type:String, default:'SAR' },
  probability: { type:Number, default:10, min:0, max:100 },
  stage:       { type:String, enum:['new','qualified','proposal','negotiation','won','lost'], default:'new' },
  expectedClose:{ type:Date },
  closedDate:  { type:Date },
  assignedTo:  { type:Schema.Types.ObjectId, ref:'User' },
  source:      { type:String },
  lostReason:  { type:String },
  description: { type:String },
  activities:  [{ type:String, date:Date, note:String, user:{ type:Schema.Types.ObjectId, ref:'User' } }],
  tags:        [String],
}, { timestamps:true })
opportunitySchema.index({ company:1, stage:1 })
const Opportunity = mongoose.model('Opportunity', opportunitySchema)

module.exports = { Contact, Opportunity }
