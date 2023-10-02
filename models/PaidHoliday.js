const mongoose = require("mongoose");

const paidHolidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
});

const paidHoliday = mongoose.model("PaidHoliday", paidHolidaySchema);
module.exports = paidHoliday;
