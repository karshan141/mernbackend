// This model stores utilized paid holiday by employees

const mongoose = require("mongoose");

const empPaidHolidaySchema = mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  paidHoliday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaidHoliday",
  },
  date: {
    type: Date,
  },
});
 
const empPaidHoliday = mongoose.model("EmpPaidHoliday",empPaidHolidaySchema);
module.exports = empPaidHoliday;
