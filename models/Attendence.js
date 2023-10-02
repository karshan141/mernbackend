const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Reference to the Employee model
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    //enum: ["present", "absent", "leave"],
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
