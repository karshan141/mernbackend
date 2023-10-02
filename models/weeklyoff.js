const mongoose = require("mongoose");

const weeklyOffSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    unique: true,
  },
  weeklyOffDay: {
    type: String,
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    required: true,
  },
  lastOffDate: {
    type: Date,
  },
  utilizedPH: [
    {
      type: Date,
      required: true,
    },
  ],
});

const WeeklyOff = mongoose.model("WeeklyOff", weeklyOffSchema);
module.exports = WeeklyOff;
