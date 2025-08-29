import doctorModel from "../model/doctorModel.js";
import otpModel from "../model/otpModel.js";
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../config/nodemailer.js";
import crypto from "crypto";

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if doctor exists
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor with this email does not exist" });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save OTP to database
    await otpModel.create({
      email,
      otp,
      expiresAt
    });
    
    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send OTP email",
        error: emailResult.error 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "OTP sent to your email address" 
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Find OTP in database
    const otpRecord = await otpModel.findOne({ email, otp, verified: false });
    
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    
    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }
    
    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    
    res.status(200).json({ 
      success: true, 
      message: "OTP verified successfully" 
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    
    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password should be at least 8 characters long" 
      });
    }
    
    // Find doctor
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    
    // Check if OTP was verified
    const otpRecord = await otpModel.findOne({ email, verified: true });
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Please verify OTP first" 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await doctorModel.findByIdAndUpdate(doctor._id, {
      password: hashedPassword
    });
    
    // Delete OTP record
    await otpModel.deleteOne({ _id: otpRecord._id });
    
    res.status(200).json({ 
      success: true, 
      message: "Password reset successfully" 
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};