import express from "express";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from "../controllers/notificationController.js";
import authAdmin from "../middleware/authAdmin.js";
import authDoctor from "../middleware/authDoctor.js";

const router = express.Router();

// Get notifications for admin
router.get("/admin", authAdmin, (req, res) => {
  req.params.userId = 'admin';
  req.params.userType = 'admin';
  getNotifications(req, res);
});

// Get notifications for doctor
router.get("/doctor", authDoctor, (req, res) => {
  req.params.userId = req.doctorId;
  req.params.userType = 'doctor';
  getNotifications(req, res);
});

// Mark notification as read
router.put("/read/:notificationId", markAsRead);

// Mark all notifications as read
router.put("/read-all/:userType", markAllAsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

export default router;