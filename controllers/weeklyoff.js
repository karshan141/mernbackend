const WeeklyOff = require("../models/weeklyoff"); // Import the WeeklyOff model

exports.setWeeklyOff = async (req, res) => {
  try {
    const { employeeId, weeklyOffDay, lastOffDate } = req.body;

    // Check if a weekly off record already exists for the employee
    let weeklyOff = await WeeklyOff.findOne({ employee: employeeId });

    if (!weeklyOff) {
      // If no weekly off record exists, create a new one
      weeklyOff = new WeeklyOff({
        employee: employeeId,
        weeklyOffDay,
        lastOffDate,
      });
    } else {
      // If a weekly off record exists, update it
      weeklyOff.weeklyOffDay = weeklyOffDay;      
      weeklyOff.lastOffDate = lastOffDate;
    }

    // Save the weekly off record
    await weeklyOff.save();

    res.status(200).json({
      success: true,
      message: "Weekly off data saved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWeeklyOff = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Fetch the weekly off data for the employee
    const weeklyOff = await WeeklyOff.findOne({ employee: employeeId });

    if (!weeklyOff) {
      // If no weekly off record exists for the employee, return an empty response
      return res.status(200).json({});
    }

    res.status(200).json(weeklyOff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
