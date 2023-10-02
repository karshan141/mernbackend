const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    

    //If username or password empty return
    if (!username || !password) {
      return res.json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(201).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }

    if (password == user.password) {
      const token = jwt.sign(
        { username: user.username, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      user.token = token;
      user.password = undefined;

      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(201).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(5000).json({
      success: false,
      message: `Login Failre Please Try Again`,
    });
  }
};
