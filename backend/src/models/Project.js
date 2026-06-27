const mongoose = require('mongoose')
const { Schema } = mongoose

const projectSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  name:        { type:String, required:true },
  code:        { type:String },
  description: { type:String },
  client:      { type:Schema.Types.ObjectId, ref:'Contact' },
  manager:     { type:Schema.Types.ObjectId, ref:'User' },
  team:        [{ type:Schema.Types.ObjectId, ref:'User' }],
  startDate:   { type:Date },
  endDate:     { type:Date },
  actualEnd:   { type:Date },
  budget:      { type:Number, default:0 },
  spent:       { type:Number, default:0 },
  currency:    { type:String, default:'SAR' },
  priority:    { type:String, enum:['low','medium','high','critical'], default:'medium' },
  status:      { type:String, enum:['planning','active','on_hold','completed','cancelled'], default:'planning' },
  progress:    { type:Number, default:0, min:0, max:100 },
  tags:        [String],
  notes:       { type:String },
  attachments: [{ name:String, url:String }],
}, { timestamps:true })
projectSchema.index({ company:1, status:1 })
const Project = mongoose.model('Project', projectSchema)

const taskSchema = new Schema({
  company:     { type:Schema.Types.ObjectId, ref:'Company', required:true },
  project:     { type:Schema.Types.ObjectId, ref:'Project', required:true },
  title:       { type:String, required:true },
  description: { type:String },
  assignee:    { type:Schema.Types.ObjectId, ref:'User' },
  reporter:    { type:Schema.Types.ObjectId, ref:'User' },
  status:      { type:String, enum:['todo','in_progress','review','done','cancelled'], default:'todo' },
  priority:    { type:String, enum:['low','medium','high','critical'], default:'medium' },
  dueDate:     { type:Date },
  completedAt: { type:Date },
  estimatedHours:{ type:Number, default:0 },
  actualHours: { type:Number, default:0 },
  tags:        [String],
  attachments: [{ name:String, url:String }],
  comments:    [{ user:{ type:Schema.Types.ObjectId, ref:'User' }, text:String, createdAt:{ type:Date, default:Date.now } }],
  parentTask:  { type:Schema.Types.ObjectId, ref:'Task' },
  order:       { type:Number, default:0 },
}, { timestamps:true })
taskSchema.index({ company:1, project:1, status:1 })
const Task = mongoose.model('Task', taskSchema)

module.exports = { Project, Task }
