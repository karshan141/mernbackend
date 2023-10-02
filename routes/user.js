const express = require("express");
const { login } = require("../controllers/login");
const { addDesignation, getAllDesignation, deleteDesignation } = require("../controllers/designation");
const { createEmployee, getAllEmployees } = require("../controllers/employee");
const { addAttendence1, getAttendanceBetweenDates, addAttendance, getEmployeeAttendanceBetweenDates, getAttendanceSpecificDate, updateAttendance } = require("../controllers/attendence");
const { setWeeklyOff } = require("../controllers/weeklyoff");
const { addPaidHolidays } = require("../controllers/paidHoliday");
const router = express.Router();

router.post("/login", login);



//Routes from Employeess

router.post("/addnewemployee",createEmployee);
router.get("/getallemployee",getAllEmployees);

//Routes for  designation functionality
router.post("/addnewdesignation",addDesignation);
router.get("/getalldesignation",getAllDesignation);
router.delete("/deletedesignation/:id",deleteDesignation);

//Routes for attendence

router.post("/addattendence",addAttendance);
router.get("/showattendence",getAttendanceBetweenDates);

router.get("/showattendencedatespecific",getAttendanceSpecificDate);

router.get("/showEmployeeattendence",getEmployeeAttendanceBetweenDates);

router.put("/editempattendence",updateAttendance);

//Routes for weekly off

router.post("/addweeklyoff",setWeeklyOff);

//Routes for PH

router.post("/addph",addPaidHolidays);

module.exports = router;
