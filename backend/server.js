import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io"; // Fixed import
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import whatsappRouter from "./routes/whatsappRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { testEmailConnection } from "./config/emailService.js";
import { testWhatsAppConnection } from "./config/whatsappService.js";
import authRoutes from "./routes/authRoutes.js";


// App Config
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { // Fixed initialization
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Test services on startup
testEmailConnection();
testWhatsAppConnection();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected");
  
  // Join room based on user type and ID
  socket.on("join", (data) => {
    socket.join(data.room);
    console.log(`User joined room: ${data.room}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Api Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/whatsapp", whatsappRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).send("API Working");
});

server.listen(port, () => console.log("Server Started on port", port));