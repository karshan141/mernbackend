const mongoose = require("mongoose");

const Attendance = require("../models/Attendence"); // Import your attendance model

const WeeklyOff = require("../models/weeklyoff"); // Import Weeklyoff Model

const PaidHoliday = require("../models/PaidHoliday"); // import paidholiday model

const EmpPaidHoliday = require("../models/EmpPaidHoliday");

const { formatDate } = require("../helper/commonuses");

// Function to add attendance record
exports.addAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;

    // Validate data for each employee here (e.g., employee existence, status validity, etc.)

    // Create an array to store promises for saving attendance records
    const savePromises = attendanceData.map(async (attendanceData) => {
      const { employeeId, status } = attendanceData;

      const isAttend = await Attendance.find({
        employeeId,
        date: new Date(date),
      }).count();

      //console.log("123", isAttend);

      if (!isAttend) {
        // Check if the status is "Leave"
        if (status === "leave") {
          const phList = await PaidHoliday.find({
            date: {
              $gte: new Date(`${date.split("-")[0]}-01-01`),
              $lte: new Date(`${date.split("-")[0]}-12-31`),
            },
          })
            .select({ date: 1 })
            .sort({ date: 1 });

          const utilizedPhListArray = await EmpPaidHoliday.find({
            employee: employeeId,
          })
            .select({ date: 1, _id: 0 })
            .sort({ date: 1 });

          let setPhDate = new Date();
          if (utilizedPhListArray.length === 0) {
            setPhDate = phList[0].date;
            setPhId = phList[0]._id;
          } else {
            const currentDate =
              utilizedPhListArray[utilizedPhListArray.length - 1].date; // Get the first date in the array

            // Find the index of the current date in phList
            const index = phList.findIndex(
              (item) => item.date.getTime() === currentDate.getTime()
            );

            if (index !== -1 && index < phList.length - 1) {
              // Get the next date from phList
              setPhDate = phList[index + 1].date;
              setPhId = phList[index + 1]._id;
            } else {
              setPhDate = "3023-09-25T13:25:48.512Z";
            }
          }

          // console.log(phList);
          // return console.log(setPhDate);

          if (setPhDate <= new Date(date)) {
            // Create a PH entry and decrement pending PH count
            const newAttendance = new Attendance({
              employeeId,
              date,
              status: `ph ${formatDate(setPhDate)}`,
            });

            await newAttendance.save();
            const newPaidHoliday = new EmpPaidHoliday({
              employee: employeeId,
              paidHoliday: setPhId,
              date: setPhDate,
            });

            await newPaidHoliday.save();
          } else {
            //return console.log(employeeId);
            // Find the employee's last weekly off date
            const weeklyOff = await WeeklyOff.findOne({ employee: employeeId });

            if (weeklyOff) {
              const lastOffDate = new Date(weeklyOff.lastOffDate);

              const lastOffDate1 = new Date(lastOffDate);
              // Add 7 days
              const newDate = new Date(lastOffDate1);
              newDate.setDate(newDate.getDate() + 7);

              // Check if the last weekly off date is less than or equal to the current date
              if (newDate <= new Date(date)) {
                // Update the status as "Off" and store the last weekly off date
                const newAttendance = new Attendance({
                  employeeId,
                  date: date,
                  status: `off ${formatDate(newDate)}`,
                  lastOff: newDate,
                });

                //return console.log(newAttendance);
                weeklyOff.lastOffDate = newDate;

                const data = await Promise.all([
                  newAttendance.save(),
                  weeklyOff.save(),
                ]);
                //return console.log(first)
              } else {
                // Create a leave record for that date
                const newAttendance = new Attendance({
                  employeeId,
                  date,
                  status: "leave",
                });

                await newAttendance.save();
              }
            } else {
              // Create a leave record for that date if no weekly off data is found
              const newAttendance = new Attendance({
                employeeId,
                date,
                status: "leave",
              });

              await newAttendance.save();
            }
          }
        } else {
          // Create a new attendance record for status other than "Leave"
          const newAttendance = new Attendance({
            employeeId,
            date,
            status,
          });

          await newAttendance.save();
        }
      } else {
        console.log("false");
      }
    });

    // Execute all save operations in parallel
    await Promise.all(savePromises);

    res.status(201).json({
      success: true,
      message: "Attendance records added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a route for adding attendance records for multiple employees
exports.addAttendence1 = async (req, res) => {
  try {
    // Parse the array of attendance data from the request body
    const { date, attendanceData } = req.body;

    //console.log(attendanceData);
    // Validate data for each employee here (e.g., employee existence, date format, status validity, etc.)

    // Create an array to store promises for saving attendance records
    const savePromises = attendanceData.map(async (attendanceData) => {
      const { employeeId, status } = attendanceData;

      const existingAttendance = await Attendance.findOne({
        employeeId,
        date,
      });

      if (existingAttendance) {
        // If a record exists, update it
        existingAttendance.status = status;
        return existingAttendance.save();
      }

      // Create a new attendance record
      const newAttendance = new Attendance({
        employeeId,
        date,
        status,
      });

      // Save the attendance record to the database
      return newAttendance.save();
    });

    // Execute all save operations in parallel
    await Promise.all(savePromises);

    res.status(201).json({
      success: true,
      message: "Attendance records added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttendanceSpecificDate = async (req, res) => {
  try {
    const { date } = req.query; // Assuming the date is passed as a query parameter

    // Query the database to retrieve attendance data for the specified date
    const attendanceData = await Attendance.find({ date });

    // Return the attendance data as a JSON response
    res.status(200).json({
      success: true,
      data: attendanceData,
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching attendance data.",
    });
  }
};

// Controller function to get attendance data between two dates
exports.getAttendanceBetweenDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Fetch attendance data for the specified date range
    const attendanceData = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate({
      path: "employeeId",
      select: "firstName", // Only select the first name
    });

    // Create an array to store the formatted data
    const formattedAttendance = [];

    // Iterate through the attendance data and format it
    attendanceData.forEach((entry) => {
      const { date, employeeId, status } = entry;
      const formattedEntry = {
        date: formatDate(date), // Format the date as needed (e.g., "19-09-2023")
        firstName: employeeId.firstName,
        status,
      };

      formattedAttendance.push(formattedEntry);
    });

    // Send the formatted data as the response
    res.status(200).json(formattedAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getEmployeeAttendanceBetweenDates = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    // Fetch attendance data for the specified date range
    const attendanceData = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).populate({
      path: "employeeId",
      select: "firstName", // Only select the first name
    });

    console.log(endDate);

    // Create an array to store the formatted data
    const formattedAttendance = [];

    // Iterate through the attendance data and format it
    attendanceData.forEach((entry) => {
      const { date, employeeId, status } = entry;
      const formattedEntry = {
        date: formatDate(date), // Format the date as needed (e.g., "19-09-2023")
        firstName: employeeId.firstName,
        status,
      };

      formattedAttendance.push(formattedEntry);
    });

    // Send the formatted data as the response
    res.status(200).json(formattedAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to update a single employee's attendance data
exports.updateAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    const newDate = date.split("-");
    const editEmployeeAttendenceDate = new Date(
      `${newDate[2]}-${newDate[1]}-${newDate[0]}`
    );

    const getAttendance = await Attendance.findOne({
      employeeId,
      date: editEmployeeAttendenceDate,
    });

    if (!getAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    const firstTwoCharacters = getAttendance.status.substring(0, 2);

    if (getAttendance.status !== status) {
      if (getAttendance.status === "absent" && status == "present") {
        getAttendance.status = status;
        await getAttendance.save();

        return res.status(200).json({
          success: true,
          message: "Attendance record updated successfully",
        });
      } else if (getAttendance.status === "present" && status == "absent") {
        getAttendance.status = status;
        await getAttendance.save();

        return res.status(200).json({
          success: true,
          message: "Attendance record updated successfully",
        });
      } else if (
        (getAttendance.status === "present" && status == "leave") ||
        (getAttendance.status === "absent" && status == "leave")
      ) {
        //Update ph list
        await updatePhList(employeeId, editEmployeeAttendenceDate);

        // Find last off day before we edit
        await updateLastOffList(employeeId, editEmployeeAttendenceDate);

        const newStatus = await calculateNewStatus(
          employeeId,
          editEmployeeAttendenceDate
        );

        const isUpdatedCurren = await Attendance.findByIdAndUpdate(
          getAttendance._id,
          { status: newStatus },
          { new: true }
        );

        //find all records with off ph status from attendence

        const getOffPh = await Attendance.find({
          employeeId,
          status: { $nin: ["present", "absent"] },
          date: { $gt: editEmployeeAttendenceDate },
        }).sort({ date: 1 });

        async function processAttendanceData() {
          for (const attendanceData of getOffPh) {
            const newStatus = await calculateNewStatus(
              attendanceData.employeeId,
              attendanceData.date
            );

            const updatedAttendance = await Attendance.findByIdAndUpdate(
              attendanceData._id, // The _id of the document to update
              { status: newStatus }, // The update to apply
              { new: true } // Return the updated document
            );
          }
        }
        processAttendanceData()
          .then(() => {
            return res
              .status(202)
              .json({ success: true, message: "Update Attendence Done" });
          })
          .catch((error) => {
            return res
              .status(202)
              .json({ success: false, message: "Server Error Try again..." });
          });
      } else if (
        (status === "leave" && firstTwoCharacters == "of") ||
        (firstTwoCharacters === "ph" && status === "leave")
      ) {
        console.log(status, firstTwoCharacters);
        return res.status(200).json({
          success: false,
          message: "Same status can not edited123",
        });
      } else {
        // return console.log();

        // if (firstTwoCharacters === "of" || firstTwoCharacters === "ph") {
        //   return res.status(200).json({
        //     success: false,
        //     message: "Same status can not edited",
        //   });
        // }

        getAttendance.status = status;
        await getAttendance.save();

        //Update ph list
        await updatePhList(employeeId, editEmployeeAttendenceDate);

        // Find last off day before we edit
        await updateLastOffList(employeeId, editEmployeeAttendenceDate);

        //find all records with off ph status from attendence

        const getOffPh = await Attendance.find({
          employeeId,
          status: { $nin: ["present", "absent"] },
          date: { $gt: editEmployeeAttendenceDate },
        }).sort({ date: 1 });

        async function processAttendanceData() {
          for (const attendanceData of getOffPh) {
            const newStatus = await calculateNewStatus(
              attendanceData.employeeId,
              attendanceData.date
            );

            const updatedAttendance = await Attendance.findByIdAndUpdate(
              attendanceData._id, // The _id of the document to update
              { status: newStatus }, // The update to apply
              { new: true } // Return the updated document
            );
          }
        }
        processAttendanceData()
          .then(() => {
            return res
              .status(202)
              .json({ success: true, message: "Update Attendence Done" });
          })
          .catch((error) => {
            return res
              .status(202)
              .json({ success: false, message: "Server Error Try again..." });
          });
      }
    } else {
      return res.status(202).json({ message: "Same status" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// //Function to updatePh List for edit functionality

const updateLastOffList = async (employeeId, editEmployeeAttendenceDate) => {
  const getLastOffDate = await Attendance.find({
    employeeId,
    status: /^of/i,
    date: { $lt: editEmployeeAttendenceDate },
  })
    .sort({ date: -1 })
    .limit(1);

  let finalLastOffDate;
  if (getLastOffDate.length > 0) {
    const findLastOffDate = getLastOffDate[0].status.split(" ");
    const parts = findLastOffDate[1].split("-");
    finalLastOffDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  } else {
    // if last off date not founde in attendence then set last off date as default we set in weekly off model;
    const getDatefromWeeklyModel = await Attendance.find({
      employeeId,
    });

    // console.log(getDatefromWeeklyModel);
    //finalLastOffDate = getDatefromWeeklyModel.lastOffDate;
  }

  // Update Last off Date in Weekly off model

  WeeklyOff.updateOne(
    { employee: employeeId }, // Query condition: Find the document with the specified employee ID
    { $set: { lastOffDate: finalLastOffDate } } // Update to apply (setting the lastOffDate field to finalLastOffDate)
  )
    .then((result) => {
      if (result.nModified === 0) {
        console.log("Document not found");
        return res
          .status(404)
          .json({ message: "Weekly off not updated try again" });
      }
    })

    .catch((err) => {
      console.error("Error updating document:", err);
      return res.status(500).json({ message: "Server error" });
    });
};

//Function to updatePh List for edit functionality

const updatePhList = async (employeeId, editEmployeeAttendenceDate) => {
  const getLastPhDate = await Attendance.find({
    employeeId,
    status: /^ph/i,
    date: { $lt: editEmployeeAttendenceDate },
  })
    .sort({ date: -1 })
    .limit(1);

  if (getLastPhDate.length > 0) {
    const findLastPhDate = getLastPhDate[0].status.split(" ");
    const parts = findLastPhDate[1].split("-");
    finalLastPhDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

    const isDeleted = await EmpPaidHoliday.deleteMany({
      employee: employeeId,
      date: { $gt: finalLastPhDate },
    })
      .then((result) => {
        //console.log(`${result.deletedCount} records removed successfully`);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    const finalLastPhDate = new Date(
      `${editEmployeeAttendenceDate.getFullYear()}-01-01`
    );

    const isDeleted = await EmpPaidHoliday.deleteMany({
      employee: employeeId,
      date: { $gt: finalLastPhDate },
    })
      .then((result) => {
        console.log(`${result.deletedCount} records removed successfully`);
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

// New Status for updateing record
async function calculateNewStatus(employeeId, date) {
  let newStatus;

  const phList = await PaidHoliday.find({
    date: {
      $gte: new Date(`${date.getFullYear()}-01-01`),
      $lte: new Date(`${date.getFullYear()}-12-31`),
    },
  })
    .select({ date: 1 })
    .sort({ date: 1 });

  const utilizedPhListArray = await EmpPaidHoliday.find({
    employee: employeeId,
  })
    .select({ date: 1, _id: 0 })
    .sort({ date: 1 });

  let setPhDate = new Date();
  if (utilizedPhListArray.length === 0) {
    setPhDate = phList[0].date;
    setPhId = phList[0]._id;
  } else {
    const currentDate =
      utilizedPhListArray[utilizedPhListArray.length - 1].date; // Get the first date in the array

    // Find the index of the current date in phList
    const index = phList.findIndex(
      (item) => item.date.getTime() === currentDate.getTime()
    );

    if (index !== -1 && index < phList.length - 1) {
      // Get the next date from phList
      setPhDate = phList[index + 1].date;
      setPhId = phList[index + 1]._id;
    } else {
      setPhDate = "3023-09-25T13:25:48.512Z";
    }
  }

  if (setPhDate <= date) {
    const newPaidHoliday = new EmpPaidHoliday({
      employee: employeeId,
      paidHoliday: setPhId,
      date: setPhDate,
    });

    const isSave = await newPaidHoliday.save();

    if (isSave) {
      const month = (setPhDate.getMonth() + 1).toString().padStart(2, "0");
      const day = setPhDate.getDate().toString().padStart(2, "0");
      newStatus = `ph ${day}-${month}-${date.getFullYear()}`;
    }
  } else {
    //return console.log(employeeId);
    // Find the employee's last weekly off date
    const weeklyOff = await WeeklyOff.findOne({ employee: employeeId });

    if (weeklyOff) {
      const lastOffDate = new Date(weeklyOff.lastOffDate);
      const lastOffDate1 = new Date(lastOffDate);
      // Add 7 days
      const newDate = new Date(lastOffDate1);
      newDate.setDate(newDate.getDate() + 7);

      // Check if the last weekly off date is less than or equal to the current date
      if (newDate <= new Date(date)) {
        // Update the status as "Off" and store the last weekly off date

        const status = `off ${formatDate(newDate)}`;

        const update = await WeeklyOff.updateOne(
          { employee: employeeId },
          { lastOffDate: newDate }
        );
        newStatus = status;
      } else {
        // Create a leave record for that date
        newStatus = "leave";
      }
    } else {
      // Create a leave record for that date if no weekly off data is found
      newStatus = "leave";
    }
  }
  return newStatus;
}
