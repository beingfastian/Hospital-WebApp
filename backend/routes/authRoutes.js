import express from "express";
import { forgotPassword, verifyOTP, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// Forgot password
router.post("/forgot-password", forgotPassword);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Reset password
router.post("/reset-password", resetPassword);

export default router;