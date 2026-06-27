const mongoose = require('mongoose')

const companySchema = new mongoose.Schema({
  name:        { type:String, required:true, trim:true },
  nameEn:      { type:String, trim:true },
  slug:        { type:String, unique:true, lowercase:true },
  logo:        { type:String, default:'' },
  email:       { type:String, lowercase:true, trim:true },
  phone:       { type:String, trim:true },
  website:     { type:String },
  address:     { street:String, city:String, state:String, zip:String, country:{ type:String, default:'SA' } },
  taxNumber:   { type:String },
  vatNumber:   { type:String },
  crNumber:    { type:String },
  industry:    { type:String },
  size:        { type:String, enum:['1-10','11-50','51-200','201-500','500+'], default:'1-10' },
  currency:    { type:String, default:'SAR' },
  language:    { type:String, default:'ar' },
  timezone:    { type:String, default:'Asia/Riyadh' },
  dateFormat:  { type:String, default:'DD/MM/YYYY' },
  fiscalYear:  { start:{ type:Number, default:1 }, end:{ type:Number, default:12 } },
  modules:     [{ type:String }],
  subscription:{ type:String, enum:['trial','free','basic','pro','enterprise'], default:'trial' },
  trialEndsAt: { type:Date },
  maxUsers:    { type:Number, default:50 },
  isActive:    { type:Boolean, default:true },
  settings: {
    theme:              { type:String, enum:['light','dark','system'], default:'light' },
    primaryColor:       { type:String, default:'#4F46E5' },
    invoicePrefix:      { type:String, default:'INV' },
    billPrefix:         { type:String, default:'BILL' },
    poPrefix:           { type:String, default:'PO' },
    enableZATCA:        { type:Boolean, default:false },
    enableNotifications:{ type:Boolean, default:true },
    requireApprovals:   { type:Boolean, default:false },
  },
  socialLinks: { linkedin:String, twitter:String, instagram:String },
}, { timestamps:true, toJSON:{ virtuals:true } })

companySchema.index({ slug:1 })
companySchema.index({ isActive:1 })
companySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'') + '-' + Date.now()
  }
  if (!this.modules?.length) {
    this.modules = ['accounting','hr','projects','crm','inventory','purchasing','pos','contracts']
  }
  if (!this.trialEndsAt) {
    this.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  next()
})
companySchema.virtual('isTrialExpired').get(function() {
  return this.subscription === 'trial' && this.trialEndsAt < new Date()
})
module.exports = mongoose.model('Company', companySchema)
