import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import whatsappRouter from "./routes/whatsappRoute.js";
import { testEmailConnection } from "./config/emailService.js";
import { testWhatsAppConnection } from "./config/whatsappService.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Test services on startup
testEmailConnection();
testWhatsAppConnection();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For WhatsApp webhook

// Api Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/whatsapp", whatsappRouter);

app.get("/", (req, res) => {
  res.status(200).send("API Working");
});

app.listen(port, () => console.log("Server Started on port", port));
