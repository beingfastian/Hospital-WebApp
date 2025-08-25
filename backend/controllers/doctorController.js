// import doctorModel from "../model/doctorModel.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import appointmentModel from "../model/appointmentModel.js";
// import leaveRequestModel from "../model/leaveRequestModel.js";

// const changeAvailabilities = async (req, res) => {
//   try {
//     const { docId } = req.body;
//     const docData = await doctorModel.findById(docId);
//     await doctorModel.findByIdAndUpdate(docId, {
//       available: !docData.available,
//     });
//     res.json({ success: true, message: "Availability Changed Successfully" });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// const doctorList = async (req, res) => {
//   try {
//     const doctors = await doctorModel.find({}).select(["-password", "-email"]);
//     res.json({
//       success: true,
//       doctors,
//       message: "Doctors List Fetched Successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API for doctor login
// const loginDoctor = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const doctor = await doctorModel.findOne({ email });
//     if (!doctor) {
//       return res.json({ success: false, message: "Invalid Credentials" });
//     }
//     const isMatch = await bcrypt.compare(password, doctor.password);
//     if (!isMatch) {
//       return res.json({ success: false, message: "Invalid Credentials" });
//     }
//     const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
//     res.json({ success: true, token });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to get doctor Appointments for doctor panel
// const appointmentsDoctor = async (req, res) => {
//   try {
//     const { docId } = req.body;
//     const appointments = await appointmentModel.find({ docId });

//     if (!appointments) {
//       return res.json({ success: false, message: "No appointments found" });
//     }
//     res.json({ success: true, appointments });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to mark appointment complete for doctor panel
// const appointmentComplete = async (req, res) => {
//   try {
//     const { docId, appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);
//     if (appointmentData && appointmentData.docId === docId) {
//       await appointmentModel.findByIdAndUpdate(appointmentId, {
//         isCompleted: true,
//       });
//       return res.json({
//         success: true,
//         message: "Appointment Completed",
//       });
//     } else {
//       res.json({ success: false, message: "Mark Failed" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to cancel appointment for doctor panel
// const appointmentCancel = async (req, res) => {
//   try {
//     const { docId, appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);
//     if (appointmentData && appointmentData.docId === docId) {
//       await appointmentModel.findByIdAndUpdate(appointmentId, {
//         cancelled: true,
//       });
//       return res.json({
//         success: true,
//         message: "Appointment Cancelled",
//       });
//     }
//     res.json({ success: false, message: "Cancellation Failed" });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to get dashboard data for doctor panel
// const doctorDashboard = async (req, res) => {
//   try {
//     const { docId } = req.body;
//     const appointments = await appointmentModel.find({ docId });
//     let earnings = 0;

//     appointments.map((item) => {
//       if (item.isCompleted || item.payment) {
//         earnings += item.amount;
//       }
//     });

//     let patients = [];

//     appointments.map((item) => {
//       if (!patients.includes(item.userId)) {
//         patients.push(item.userId);
//       }
//     });

//     const dashData = {
//       earnings,
//       appointments: appointments.length,
//       patients: patients.length,
//       latestAppointments: appointments.reverse().slice(0, 5),
//     };

//     res.json({ success: true, dashData });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to get doctor profile for doctor panel
// const doctorProfile = async (req, res) => {
//   try {
//     const { docId } = req.body;
//     const profileData = await doctorModel.findById(docId).select("-password");
//     res.json({ success: true, profileData });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to update doctor profile for doctor panel
// const updateDoctorProfile = async (req, res) => {
//   try {
//     const { docId, fee, address, available } = req.body;
//     await doctorModel.findByIdAndUpdate(docId, { fee, address, available });
//     res.json({ success: true, message: "Profile Updated Successfully" });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Doctor applies for leave
// const requestLeave = async (req, res) => {
//   try {
//     const { dToken } = req.headers;
//     const { fromDate, toDate, reason, type } = req.body;
//     const doctorId = req.doctorId || req.body.docId; // Adjust according to your auth

//     if (!fromDate || !toDate || !reason) {
//       return res.json({ success: false, message: "All fields are required" });
//     }

//     // Check for overlapping leave
//     const overlap = await leaveRequestModel.findOne({
//       doctorId,
//       status: { $ne: "rejected" },
//       $or: [
//         { fromDate: { $lte: new Date(toDate) }, toDate: { $gte: new Date(fromDate) } },
//       ],
//     });
//     if (overlap) {
//       return res.json({
//         success: false,
//         message: "Leave request overlaps with existing request",
//       });
//     }

//     await leaveRequestModel.create({
//       doctorId,
//       fromDate,
//       toDate,
//       reason,
//       type,
//     });

//     res.json({ success: true, message: "Leave request submitted" });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // List doctor's leave requests
// const listLeaveRequests = async (req, res) => {
//   try {
//     const doctorId = req.doctorId || req.headers.docid || req.body.docId;
//     const leaveRequests = await leaveRequestModel
//       .find({ doctorId })
//       .sort({ submittedAt: -1 });
//     res.json({ success: true, leaveRequests });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Cancel a pending leave request
// const cancelLeaveRequest = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const leave = await leaveRequestModel.findById(id);
//     if (!leave || leave.status !== "pending") {
//       return res.json({ success: false, message: "Cannot cancel this leave request" });
//     }
//     await leaveRequestModel.findByIdAndDelete(id);
//     res.json({ success: true, message: "Leave request cancelled" });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export {
//   changeAvailabilities,
//   doctorList,
//   loginDoctor,
//   appointmentsDoctor,
//   appointmentComplete,
//   appointmentCancel,
//   doctorDashboard,
//   doctorProfile,
//   updateDoctorProfile,
//   requestLeave,
//   listLeaveRequests,
//   cancelLeaveRequest,
// };



import doctorModel from "../model/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../model/appointmentModel.js";
import leaveRequestModel from "../model/leaveRequestModel.js";

const changeAvailabilities = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({
      success: true,
      doctors,
      message: "Doctors List Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor Appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    if (!appointments) {
      return res.json({ success: false, message: "No appointments found" });
    }
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment complete for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({
        success: true,
        message: "Appointment Completed",
      });
    } else {
      res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({
        success: true,
        message: "Appointment Cancelled",
      });
    }
    res.json({ success: false, message: "Cancellation Failed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    let earnings = 0;

    // Calculate earnings from completed appointments
    appointments.map((item) => {
      if (item.isCompleted) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile for doctor panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fee, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(docId, { fee, address, available });
    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Doctor applies for leave
const requestLeave = async (req, res) => {
  try {
    const doctorId = req.doctorId; // Only use req.doctorId from authDoctor
    const { fromDate, toDate, reason, type } = req.body;

    if (!doctorId) {
      return res.json({ success: false, message: "Doctor not authenticated" });
    }
    if (!fromDate || !toDate || !reason) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // Check for overlapping leave
    const overlap = await leaveRequestModel.findOne({
      doctorId,
      status: { $ne: "rejected" },
      $or: [
        { fromDate: { $lte: new Date(toDate) }, toDate: { $gte: new Date(fromDate) } },
      ],
    });
    if (overlap) {
      return res.json({
        success: false,
        message: "Leave request overlaps with existing request",
      });
    }

    await leaveRequestModel.create({
      doctorId,
      fromDate,
      toDate,
      reason,
      type,
    });

    res.json({ success: true, message: "Leave request submitted" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// List doctor's leave requests
const listLeaveRequests = async (req, res) => {
  try {
    const doctorId = req.doctorId || req.headers.docid || req.body.docId;
    const leaveRequests = await leaveRequestModel
      .find({ doctorId })
      .sort({ submittedAt: -1 });
    res.json({ success: true, leaveRequests });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Cancel a pending leave request
const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await leaveRequestModel.findById(id);
    if (!leave || leave.status !== "pending") {
      return res.json({ success: false, message: "Cannot cancel this leave request" });
    }
    await leaveRequestModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Leave request cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailabilities,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  requestLeave,
  listLeaveRequests,
  cancelLeaveRequest,
};