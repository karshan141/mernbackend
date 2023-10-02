const mongoose = require("mongoose");
const Employee = require("../models/Employee");

exports.createEmployee = async (req, res) => {
  try {
    const { firstName, middleName, lastName, pfNumber, baseNumber, category } =
      req.body;

    // Check if a record with the same pfNumber already exists
    const existingEmployee = await Employee.findOne({ pfNumber });

    if (existingEmployee) {
      return res
        .status(200)
        .json({ message: "The provided pfNumber already exists." });
    }

    const newEmployee = new Employee({
      firstName,
      middleName,
      lastName,
      pfNumber,
      baseNumber,
      category,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    // Fetch all employees from the database
    const employees = await Employee.find().populate('category');
    // Send the list of employees as a response
    res.status(201).json({
      success: true,
      message: "Employee Fetched successfully",
      data: employees,
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: "Internal Server Error" });
  }
};
