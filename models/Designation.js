const mongoose = require("mongoose");

const designationSchema = mongoose.Schema(
  {
    designation: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true, // Add timestamps
  }
);

module.exports = mongoose.model("Designation", designationSchema);
