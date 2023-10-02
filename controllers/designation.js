const mongoose = require("mongoose");
const Designation = require("../models/Designation");

require("dotenv").config();

exports.addDesignation = async (req, res) => {
  try {
    const { designation } = req.body;
    if (!designation) {
      return res.status(201).json({
        success: false,
        message: `Pls Enter Designation`,
      });
    }

    const desc = await Designation.findOne({ designation });
    if (desc) {
      return res.status(201).json({
        success: false,
        message: `Designesition already available`,
      });
    }

    const newDesignation = new Designation({ designation: designation });
    const savedDesignation = await newDesignation.save();

    return res.status(201).json({
      success: true,
      message: `Designation added successfully`,
      data: savedDesignation,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      success: false,
      message: `Add Designation Failed try again`,
    });
  }
};

exports.getAllDesignation = async (req, res) => {
  try {
    const designation = await Designation.find();

    if (!designation) {
      return res.status(201).json({
        success: false,
        message: `No Category Awailabale`,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Designation fetched successfully`,
      data: designation,
    });
  } catch (error) {
    console.log("first", error);
    return res.status(200).json({
      success: false,
      message: `Failed to load Designation Please try again`,
    });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await Designation.findByIdAndRemove(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    return res.json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error) {
    console.log("first", error);
    return res.status(200).json({
      success: false,
      message: `Failed to load Designation Please try again`,
    });
  }
};
