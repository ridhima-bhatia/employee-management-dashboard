const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  gender: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  photo: { type: String },
  resume: { type: String },
  resumeName: { type: String },
}, {
  timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
