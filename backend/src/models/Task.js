const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  priority:  { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  color:     { type: String, default: '#6750A4' },
  category:  { type: String, default: '', trim: true },
  dueAt:     { type: Date, default: null },
}, { timestamps: true });

TaskSchema.index({ user: 1, createdAt: -1 });
TaskSchema.index({ user: 1, completed: 1, createdAt: -1 });
TaskSchema.index({ user: 1, dueAt: 1 });
TaskSchema.index({ user: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Task', TaskSchema);
