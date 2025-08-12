import express from "express";
import { handleWhatsAppWebhook, sendWhatsAppNotification } from "../controllers/whatsappController.js";
import authUser from "../middleware/authUser.js";

const whatsappRouter = express.Router();

// Webhook for receiving WhatsApp messages (no auth needed for Twilio webhook)
whatsappRouter.post("/webhook", handleWhatsAppWebhook);

// Send WhatsApp notification (requires auth)
whatsappRouter.post("/send-notification", authUser, sendWhatsAppNotification);

export default whatsappRouter;