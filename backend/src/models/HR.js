const mongoose = require('mongoose')
const { Schema } = mongoose

// Department
const departmentSchema = new Schema({
  company:   { type:Schema.Types.ObjectId, ref:'Company', required:true },
  name:      { type:String, required:true },
  nameEn:    { type:String },
  manager:   { type:Schema.Types.ObjectId, ref:'Employee' },
  parent:    { type:Schema.Types.ObjectId, ref:'Department' },
  budget:    { type:Number, default:0 },
  headcount: { type:Number, default:0 },
  isActive:  { type:Boolean, default:true },
}, { timestamps:true })
const Department = mongoose.model('Department', departmentSchema)

// Employee
const employeeSchema = new Schema({
  company:       { type:Schema.Types.ObjectId, ref:'Company', required:true },
  user:          { type:Schema.Types.ObjectId, ref:'User' },
  employeeId:    { type:String },
  name:          { type:String, required:true },
  nameEn:        { type:String },
  email:         { type:String, lowercase:true },
  phone:         { type:String },
  mobile:        { type:String },
  nationalId:    { type:String },
  passportNumber:{ type:String },
  iqamaNumber:   { type:String },
  nationality:   { type:String },
  gender:        { type:String, enum:['male','female'] },
  maritalStatus: { type:String, enum:['single','married','divorced','widowed'] },
  dateOfBirth:   { type:Date },
  avatar:        { type:String, default:'' },
  department:    { type:Schema.Types.ObjectId, ref:'Department' },
  jobTitle:      { type:String },
  jobGrade:      { type:String },
  manager:       { type:Schema.Types.ObjectId, ref:'Employee' },
  hireDate:      { type:Date },
  contractType:  { type:String, enum:['permanent','contract','part_time','intern','temporary'], default:'permanent' },
  contractEndDate:{ type:Date },
  workLocation:  { type:String, enum:['office','remote','hybrid'], default:'office' },
  salary:        { type:Number, default:0, min:0 },
  salaryType:    { type:String, enum:['monthly','hourly','daily'], default:'monthly' },
  bankName:      { type:String },
  bankAccount:   { type:String },
  bankIban:      { type:String },
  annualLeaveBalance:  { type:Number, default:21 },
  sickLeaveBalance:    { type:Number, default:14 },
  status:        { type:String, enum:['active','inactive','on_leave','terminated','suspended'], default:'active' },
  terminationDate:{ type:Date },
  terminationReason:{ type:String },
  address:       { street:String, city:String, country:String },
  emergencyContact:{ name:String, phone:String, relation:String },
  skills:        [String],
  documents:     [{ name:String, type:String, url:String, expiryDate:Date }],
  notes:         { type:String },
  performanceRating:{ type:Number, min:1, max:5 },
}, { timestamps:true })
employeeSchema.index({ company:1, status:1 })
employeeSchema.index({ company:1, department:1 })
const Employee = mongoose.model('Employee', employeeSchema)

// Leave
const leaveSchema = new Schema({
  company:    { type:Schema.Types.ObjectId, ref:'Company', required:true },
  employee:   { type:Schema.Types.ObjectId, ref:'Employee', required:true },
  type:       { type:String, enum:['annual','sick','emergency','maternity','paternity','hajj','unpaid','compensation','study'], required:true },
  from:       { type:Date, required:true },
  to:         { type:Date, required:true },
  days:       { type:Number, min:0.5 },
  halfDay:    { type:Boolean, default:false },
  reason:     { type:String },
  status:     { type:String, enum:['pending','approved','rejected','cancelled'], default:'pending' },
  approvedBy: { type:Schema.Types.ObjectId, ref:'User' },
  approvedAt: { type:Date },
  rejectionReason:{ type:String },
  attachments:[{ name:String, url:String }],
  notes:      { type:String },
}, { timestamps:true })
leaveSchema.index({ company:1, employee:1 })
leaveSchema.index({ company:1, from:1, status:1 })
const Leave = mongoose.model('Leave', leaveSchema)

// Payroll
const payrollSchema = new Schema({
  company:         { type:Schema.Types.ObjectId, ref:'Company', required:true },
  employee:        { type:Schema.Types.ObjectId, ref:'Employee', required:true },
  month:           { type:Number, required:true, min:1, max:12 },
  year:            { type:Number, required:true },
  workingDays:     { type:Number, default:30 },
  actualDays:      { type:Number },
  basicSalary:     { type:Number, required:true, min:0 },
  allowances: [{
    name:  { type:String },
    type:  { type:String, enum:['housing','transport','food','phone','medical','other'] },
    amount:{ type:Number, min:0 },
    taxable:{ type:Boolean, default:false },
  }],
  deductions: [{
    name:  { type:String },
    type:  { type:String, enum:['absence','gosi','tax','loan','advance','other'] },
    amount:{ type:Number, min:0 },
  }],
  overtimeHours:  { type:Number, default:0 },
  overtimeRate:   { type:Number, default:1.5 },
  overtimeAmount: { type:Number, default:0 },
  grossSalary:    { type:Number, default:0 },
  gosiEmployee:   { type:Number, default:0 }, // 10% of basic
  gosiEmployer:   { type:Number, default:0 }, // 12% of basic
  taxAmount:      { type:Number, default:0 },
  totalDeductions:{ type:Number, default:0 },
  netSalary:      { type:Number, default:0 },
  currency:       { type:String, default:'SAR' },
  status:         { type:String, enum:['draft','approved','paid','cancelled'], default:'draft' },
  paymentMethod:  { type:String, enum:['bank','cash','cheque'], default:'bank' },
  paymentDate:    { type:Date },
  paymentRef:     { type:String },
  journal:        { type:Schema.Types.ObjectId, ref:'Journal' },
  approvedBy:     { type:Schema.Types.ObjectId, ref:'User' },
  notes:          { type:String },
}, { timestamps:true })
payrollSchema.index({ company:1, month:1, year:1 })
payrollSchema.index({ company:1, employee:1, month:1, year:1 }, { unique:true })
const Payroll = mongoose.model('Payroll', payrollSchema)

module.exports = { Department, Employee, Leave, Payroll }
