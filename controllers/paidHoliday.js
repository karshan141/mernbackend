const PaidHoliday = require("../models/PaidHoliday"); // Import your Mongoose model

// Controller function to add data
exports.addPaidHolidays = async (req, res) => {
  try {
    // Extract the request body data
    const requestData = req.body;

    // Ensure that requestData is an array
    if (!Array.isArray(requestData)) {
      return res.status(200).json({
        success: false,
        message: "Request data should be an array of objects.",
      });
    }

    const condition = {
      date: { $gte: new Date("2023-01-01"), $lte: new Date("2023-12-31") },
    };

    const count  = await PaidHoliday.countDocuments(condition);
    

    if((count + requestData.length) > 9){
        return res.status(200).json({
            success: false,
            message: `Only Nine Ph Per Year Allow you alredy insert ${count} and you try to add ${requestData.length} more ph which is more than 9`,
          });

    }

    

    // Create new documents for each item in the requestData array
    const createdHolidays = await PaidHoliday.insertMany(requestData);

    // Respond with the created documents
    res.status(201).json({
      success: true,
      message: "Ph added successfully",
      createdHolidays,
    });
  } catch (error) {
    // Handle any errors and send an error response
    console.error("Error adding paid holidays:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding paid holidays.",
    });
  }
};
