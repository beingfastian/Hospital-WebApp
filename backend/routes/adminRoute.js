import express from "express";
import {
  addDoctor,
  updateDoctor,
  deleteDoctor,
  allDoctors,
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  addPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  bookAppointmentForPatient,
  getWhatsAppStats,
} from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
import { changeAvailabilities } from "../controllers/doctorController.js";

const adminRouter = express.Router();

// Doctor Management Routes
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.put("/update-doctor/:doctorId", authAdmin, updateDoctor);
adminRouter.delete("/delete-doctor/:doctorId", authAdmin, deleteDoctor);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailabilities);

// Patient Management Routes
adminRouter.post("/add-patient", authAdmin, upload.single("image"), addPatient);
adminRouter.get("/all-patients", authAdmin, getAllPatients);
adminRouter.put("/update-patient/:patientId", authAdmin, updatePatient);
adminRouter.delete("/delete-patient/:patientId", authAdmin, deletePatient);

// Appointment Management Routes
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointments", authAdmin, appointmentCancel);
adminRouter.post("/book-appointment-for-patient", authAdmin, bookAppointmentForPatient);

// Dashboard and Statistics
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get("/whatsapp-stats", authAdmin, getWhatsAppStats);

// Authentication
adminRouter.post("/login", loginAdmin);

export default adminRouter;