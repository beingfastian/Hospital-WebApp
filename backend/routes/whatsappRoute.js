import express from "express";
import { 
  handleWhatsAppWebhook, 
  sendWhatsAppNotification, 
  sendWhatsAppAppointmentReminder,
  testWhatsApp 
} from "../controllers/whatsappController.js";
import authUser from "../middleware/authUser.js";
import authAdmin from "../middleware/authAdmin.js";

const whatsappRouter = express.Router();

// Webhook for receiving WhatsApp messages (no auth needed for Twilio webhook)
whatsappRouter.post("/webhook", handleWhatsAppWebhook);

// Send WhatsApp notification (requires user auth)
whatsappRouter.post("/send-notification", authUser, sendWhatsAppNotification);

// Send WhatsApp reminder (requires admin auth)
whatsappRouter.post("/send-reminder", authAdmin, sendWhatsAppAppointmentReminder);

// Test WhatsApp connection (requires admin auth)
whatsappRouter.post("/test", authAdmin, testWhatsApp);

export default whatsappRouter;