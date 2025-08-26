import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../model/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../model/appointmentModel.js";
import userModel from "../model/userModel.js";
import leaveRequestModel from "../model/leaveRequestModel.js";
import { 
  sendUserAppointmentConfirmation, 
  sendDoctorAppointmentNotification, 
  sendAdminAppointmentNotification 
} from "../config/emailService.js";
import { sendWhatsAppConfirmation, sendDoctorWhatsAppConfirmation } from "../config/whatsappService.js";

// API for adding doctors
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      experience,
      about,
      fee,
      degree,
      address,
      whatsappEnabled,
      whatsappNumber,
      timings,
      sittingDays,
      holidays
    } = req.body;

    const imageFile = req.file;

    // Check for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !about ||
      !fee ||
      !degree ||
      !address ||
      !experience
    ) {
      return res.json({ success: false, message: "Please Fill All Fields" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please Enter a valid Email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }

    // Check if doctor with email already exists
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.json({ success: false, message: "Doctor with this email already exists" });
    }

    // Hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload Image to cloudinary server
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fee,
      address: JSON.parse(address),
      date: Date.now(),
      // --- New fields ---
      whatsappEnabled: whatsappEnabled === 'true' || whatsappEnabled === true,
      whatsappNumber: whatsappNumber || "",
      timings: timings ? JSON.parse(timings) : { start: "09:00", end: "17:00" },
      sittingDays: sittingDays ? JSON.parse(sittingDays) : [],
      holidays: holidays || ""
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor
const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      name,
      email,
      experience,
      fee,
      about,
      speciality,
      degree,
      address,
      available
    } = req.body;

    // Validate input
    if (!name || !email || !experience || !fee || !about || !speciality || !degree || !address) {
      return res.json({ success: false, message: "Please fill all required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // Check if doctor exists
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Check if email is taken by another doctor
    const emailExists = await doctorModel.findOne({ 
      email, 
      _id: { $ne: doctorId } 
    });
    if (emailExists) {
      return res.json({ success: false, message: "Email already taken by another doctor" });
    }

    // Update doctor
    await doctorModel.findByIdAndUpdate(doctorId, {
      name,
      email,
      experience,
      fee: Number(fee),
      about,
      speciality,
      degree,
      address,
      available: available !== undefined ? available : doctor.available
    });

    res.json({ success: true, message: "Doctor updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await leaveRequestModel.find({})
      .populate('doctorId', 'name email speciality image') // Populate doctor info
      .sort({ submittedAt: -1 });

    // If populate doesn't work (because doctorId is String), fetch doctor data manually
    const requestsWithDoctorData = await Promise.all(
      leaveRequests.map(async (request) => {
        const doctor = await doctorModel.findById(request.doctorId).select('name email speciality image');
        return {
          ...request.toObject(),
          doctorData: doctor
        };
      })
    );

    res.json({ 
      success: true, 
      leaveRequests: requestsWithDoctorData 
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const approveLeaveRequest = async (req, res) => {
  try {
    const { requestId, adminResponse } = req.body;

    if (!requestId) {
      return res.json({ success: false, message: "Request ID is required" });
    }

    const leaveRequest = await leaveRequestModel.findById(requestId);
    if (!leaveRequest) {
      return res.json({ success: false, message: "Leave request not found" });
    }

    if (leaveRequest.status !== 'pending') {
      return res.json({ success: false, message: "Leave request is not pending" });
    }

    await leaveRequestModel.findByIdAndUpdate(requestId, {
      status: 'approved',
      adminResponse: adminResponse || 'Leave request approved',
      approvedBy: 'admin', // You can store actual admin ID here
      approvedAt: new Date()
    });

    // Get doctor info for notification
    const doctor = await doctorModel.findById(leaveRequest.doctorId);
    
    // Send notification to doctor (optional)
    try {
      if (doctor && doctor.email) {
        // You can implement email notification here
        console.log(`Leave approved for Dr. ${doctor.name}`);
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the approval if notification fails
    }

    res.json({ success: true, message: "Leave request approved successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to reject leave request
const rejectLeaveRequest = async (req, res) => {
  try {
    const { requestId, adminResponse } = req.body;

    if (!requestId) {
      return res.json({ success: false, message: "Request ID is required" });
    }

    if (!adminResponse || adminResponse.trim() === '') {
      return res.json({ success: false, message: "Rejection reason is required" });
    }

    const leaveRequest = await leaveRequestModel.findById(requestId);
    if (!leaveRequest) {
      return res.json({ success: false, message: "Leave request not found" });
    }

    if (leaveRequest.status !== 'pending') {
      return res.json({ success: false, message: "Leave request is not pending" });
    }

    await leaveRequestModel.findByIdAndUpdate(requestId, {
      status: 'rejected',
      adminResponse,
      approvedBy: 'admin',
      approvedAt: new Date()
    });

    // Get doctor info for notification
    const doctor = await doctorModel.findById(leaveRequest.doctorId);
    
    // Send notification to doctor (optional)
    try {
      if (doctor && doctor.email) {
        console.log(`Leave rejected for Dr. ${doctor.name}: ${adminResponse}`);
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.json({ success: true, message: "Leave request rejected successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get leave requests statistics
const getLeaveStats = async (req, res) => {
  try {
    const totalRequests = await leaveRequestModel.countDocuments({});
    const pendingRequests = await leaveRequestModel.countDocuments({ status: 'pending' });
    const approvedRequests = await leaveRequestModel.countDocuments({ status: 'approved' });
    const rejectedRequests = await leaveRequestModel.countDocuments({ status: 'rejected' });

    // Get current month's requests
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyRequests = await leaveRequestModel.countDocuments({
      submittedAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    res.json({
      success: true,
      stats: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        thisMonth: monthlyRequests
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Check if doctor exists
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Check for active appointments
    const activeAppointments = await appointmentModel.find({
      docId: doctorId,
      cancelled: false,
      isCompleted: false
    });

    if (activeAppointments.length > 0) {
      return res.json({ 
        success: false, 
        message: `Cannot delete doctor. There are ${activeAppointments.length} active appointments.` 
      });
    }

    // Delete doctor
    await doctorModel.findByIdAndDelete(doctorId);

    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for adding patients
const addPatient = async (req, res) => {
  try {
    const {
      name,
      cnic,
      phone,
      dob,
      gender,
      address,
      whatsappEnabled,
      whatsappNumber
    } = req.body;

    const imageFile = req.file;

    // Validate required fields (remove email/password)
    if (!name || !cnic || !phone || !dob || !address) {
      return res.json({ success: false, message: "Please fill all required fields" });
    }

    // Validate CNIC (must be 13 digits)
    if (!/^\d{13}$/.test(cnic)) {
      return res.json({ success: false, message: "CNIC must be exactly 13 digits" });
    }

    // Check if user already exists by CNIC or phone
    const existingUser = await userModel.findOne({ $or: [{ cnic }, { phone }] });
    if (existingUser) {
      return res.json({ success: false, message: "Patient with this CNIC or phone already exists" });
    }

    // Upload image if provided
    let imageUrl = null;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    }

    const patientData = {
      name,
      cnic,
      phone,
      dob,
      gender: gender || "Male",
      address: JSON.parse(address),
      whatsappEnabled: whatsappEnabled === 'true' || whatsappEnabled === true,
      whatsappNumber: whatsappNumber || phone,
      ...(imageUrl && { image: imageUrl })
    };

    const newPatient = new userModel(patientData);
    await newPatient.save();

    res.json({ success: true, message: "Patient added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await userModel.find({}).select("-password");
    res.json({ success: true, patients });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update patient
const updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      name,
      email,
      phone,
      dob,
      gender,
      address,
      whatsappEnabled,
      whatsappNumber
    } = req.body;

    // Validate input
    if (!name || !email || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Please fill all required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // Check if patient exists
    const patient = await userModel.findById(patientId);
    if (!patient) {
      return res.json({ success: false, message: "Patient not found" });
    }

    // Check if email is taken by another patient
    const emailExists = await userModel.findOne({ 
      email, 
      _id: { $ne: patientId } 
    });
    if (emailExists) {
      return res.json({ success: false, message: "Email already taken by another patient" });
    }

    // Update patient
    await userModel.findByIdAndUpdate(patientId, {
      name,
      email,
      phone,
      dob,
      gender,
      address,
      whatsappEnabled: whatsappEnabled === 'true' || whatsappEnabled === true,
      whatsappNumber: whatsappNumber || phone
    });

    res.json({ success: true, message: "Patient updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete patient
const deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if patient exists
    const patient = await userModel.findById(patientId);
    if (!patient) {
      return res.json({ success: false, message: "Patient not found" });
    }

    // Delete all appointments for this patient
    await appointmentModel.deleteMany({ userId: patientId });

    // Delete patient
    await userModel.findByIdAndDelete(patientId);

    res.json({ success: true, message: "Patient and associated appointments deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment for patient (admin booking)
const bookAppointmentForPatient = async (req, res) => {
  try {
    const {
      patientSelectionMode,
      selectedPatientId,
      newPatientData,
      docId,
      slotDate,
      slotTime,
      discountPercent,
      finalFee
    } = req.body;

    let patientId = selectedPatientId;
    let userData;

    // If booking for new patient, create the patient first
    if (patientSelectionMode === "new") {
      // Accept CNIC-based patient creation (no email required)
      const { name, phone, cnic, dob, gender, address, whatsappEnabled, whatsappNumber } = newPatientData;

      if (!name || !phone || !cnic || !dob || !address.line1) {
        return res.json({ success: false, message: "Please fill all required patient fields" });
      }

      if (!/^\d{13}$/.test(cnic)) {
        return res.json({ success: false, message: "CNIC must be exactly 13 digits" });
      }

      // Check if user already exists by CNIC or phone
      const existingUser = await userModel.findOne({ $or: [{ cnic }, { phone }] });
      if (existingUser) {
        return res.json({ success: false, message: "Patient with this CNIC or phone already exists" });
      }

      const patientData = {
        name,
        cnic,
        phone,
        dob,
        gender,
        address,
        whatsappEnabled: whatsappEnabled || false,
        whatsappNumber: whatsappNumber || phone
      };

      const newPatient = new userModel(patientData);
      const savedPatient = await newPatient.save();
      patientId = savedPatient._id.toString();
      userData = savedPatient.toObject();
      delete userData.password;
    } else {
      // Use existing patient
      userData = await userModel.findById(selectedPatientId).select("-password");
      if (!userData) {
        return res.json({ success: false, message: "Selected patient not found" });
      }
    }

    // Get doctor data
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available for appointments",
      });
    }

    // Check slot availability
    let slots_booked = docData.slots_booked;
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Selected time slot is not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    // Create appointment (support discount/finalFee if provided)
    const appointmentData = {
      userId: patientId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData: docData.toObject(),
      amount: docData.fee,
      date: new Date().getTime(),
      ...(typeof discountPercent !== "undefined" && { discountPercent }),
      ...(typeof finalFee !== "undefined" && { finalFee })
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update doctor's booked slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Send notifications
    try {
      // Send WhatsApp notification if user has WhatsApp enabled
      if (userData.whatsappEnabled && userData.whatsappNumber) {
        console.log('Attempting WhatsApp notification to patient:', userData.whatsappNumber);
        const patientWhatsAppResult = await sendWhatsAppConfirmation(
          userData.whatsappNumber,
          userData.name,
          docData.name,
          docData.speciality,
          slotDate,
          slotTime,
          docData.fee,
          newAppointment._id.toString()
        );
        if (patientWhatsAppResult.success) {
          console.log('WhatsApp notification sent to patient:', patientWhatsAppResult.messageId);
        } else {
          console.error('WhatsApp notification to patient failed:', patientWhatsAppResult.error || patientWhatsAppResult.message);
        }
      }

      // Send WhatsApp notification to doctor if enabled
      if (docData.whatsappEnabled && docData.whatsappNumber) {
        console.log('Attempting WhatsApp notification to doctor:', docData.whatsappNumber);
        const doctorWhatsAppResult = await sendDoctorWhatsAppConfirmation(
          docData.whatsappNumber,
          docData.name,
          userData.name,
          userData.phone,
          slotDate,
          slotTime,
          docData.fee,
          newAppointment._id.toString()
        );
        if (doctorWhatsAppResult.success) {
          console.log('WhatsApp notification sent to doctor:', doctorWhatsAppResult.messageId);
        } else {
          console.error('WhatsApp notification to doctor failed:', doctorWhatsAppResult.error || doctorWhatsAppResult.message);
        }
      }

      // Send email notifications only if patient has email
      if (userData.email) {
        await sendUserAppointmentConfirmation(
          userData.email,
          userData.name,
          docData.name,
          docData.speciality,
          slotDate,
          slotTime,
          docData.fee
        );
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the appointment if notifications fail
    }

    const successMessage = patientSelectionMode === "new" 
      ? "New patient created and appointment booked successfully" 
      : "Appointment booked successfully";

    res.json({ success: true, message: successMessage });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for the admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({
        success: true,
        message: "Admin Logged in Successfully",
        token,
      });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({
      success: true,
      message: "Doctors Data Fetch Successfully",
      doctors,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all Appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Release doctor's slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get WhatsApp statistics
const getWhatsAppStats = async (req, res) => {
  try {
    const enabledUsers = await userModel.countDocuments({ whatsappEnabled: true });
    
    // Get today's appointments with WhatsApp enabled users
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const todayAppointments = await appointmentModel.find({
      date: { $gte: startOfDay.getTime(), $lte: endOfDay.getTime() }
    });
    
    const todayNotifications = todayAppointments.filter(
      apt => apt.userData?.whatsappEnabled
    ).length;

    res.json({
      success: true,
      data: {
        enabledUsers,
        todayNotifications
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  updateDoctor,
  deleteDoctor,
  addPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  bookAppointmentForPatient,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  getWhatsAppStats,
  adminDashboard,
  // Add these new exports:
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveStats,
};