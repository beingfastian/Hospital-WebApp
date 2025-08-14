import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../model/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../model/doctorModel.js";
import appointmentModel from "../model/appointmentModel.js";
import { 
  sendUserAppointmentConfirmation, 
  sendDoctorAppointmentNotification, 
  sendAdminAppointmentNotification 
} from "../config/emailService.js";
import { sendWhatsAppConfirmation } from "../config/whatsappService.js";

// API to register user (enhanced with WhatsApp fields)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, whatsappEnabled, whatsappNumber } = req.body;

    // Validating that required fields are not empty
    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validating Email Format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validating Password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }

    // Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hashing User Password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashPassword,
      phone: phone || "00000-00000",
      whatsappEnabled: whatsappEnabled || false,
      whatsappNumber: whatsappNumber || phone || "",
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ success: true, message: "User Login successfully", token });
    } else {
      res.json({ success: false, message: "Incorrect Password" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get User Profile Data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update User Profile (Enhanced with WhatsApp fields)
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender, whatsappEnabled, whatsappNumber } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Some Data are Missing" });
    }

    // Validate WhatsApp number if WhatsApp is enabled
    if ((whatsappEnabled === 'true' || whatsappEnabled === true) && !whatsappNumber) {
      return res.json({ 
        success: false, 
        message: "WhatsApp number is required when WhatsApp notifications are enabled" 
      });
    }
    
    // Update basic profile with WhatsApp settings
    const updateData = {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
      whatsappEnabled: whatsappEnabled === 'true' || whatsappEnabled === true,
      whatsappNumber: whatsappNumber || phone // Use phone as WhatsApp number if not provided
    };

    await userModel.findByIdAndUpdate(userId, updateData);

    if (imageFile) {
      // Upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book Appointment (Enhanced with improved notifications)
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available for Appointment",
      });
    }

    let slots_booked = docData.slots_booked;

    // checking for slots availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot is not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData: userData.toObject(),
      docData: docData.toObject(),
      amount: docData.fee,
      date: new Date().getTime(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Enhanced notification system
    try {
      // Send WhatsApp notification if user has WhatsApp enabled
      if (userData.whatsappEnabled && userData.whatsappNumber) {
        console.log('Sending WhatsApp notification to:', userData.whatsappNumber);
        await sendWhatsAppConfirmation(
          userData.whatsappNumber,
          userData.name,
          docData.name,
          docData.speciality,
          slotDate,
          slotTime,
          docData.fee,
          newAppointment._id.toString()
        );
        console.log('WhatsApp notification sent successfully');
      } else {
        console.log('WhatsApp not enabled for user or no WhatsApp number');
      }

      // Always send email notifications
      await sendUserAppointmentConfirmation(
        userData.email,
        userData.name,
        docData.name,
        docData.speciality,
        slotDate,
        slotTime,
        docData.fee
      );

      // Send notification email to doctor
      await sendDoctorAppointmentNotification(
        docData.email,
        docData.name,
        userData.name,
        userData.email,
        slotDate,
        slotTime,
        docData.fee
      );

      // Send notification email to admin if configured
      if (process.env.ADMIN_EMAIL) {
        await sendAdminAppointmentNotification(
          docData.name,
          userData.name,
          userData.email,
          slotDate,
          slotTime,
          docData.fee
        );
      }

      console.log('All appointment notifications sent successfully');
    } catch (notificationError) {
      console.error('Error sending appointment notifications:', notificationError);
      // Don't fail the appointment booking if notifications fail
    }

    res.json({ success: true, message: "Appointment booked successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get User Appointments for My Appointments Page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // Verify that the appointment is booked by this user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Releasing doctor's slot
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

// API to get user by WhatsApp number (for WhatsApp webhook)
const getUserByWhatsApp = async (req, res) => {
  try {
    const { whatsappNumber } = req.body;
    
    const user = await userModel.findOne({
      $or: [
        { whatsappNumber: whatsappNumber },
        { phone: whatsappNumber }
      ]
    }).select("-password");
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  getUserByWhatsApp,
};