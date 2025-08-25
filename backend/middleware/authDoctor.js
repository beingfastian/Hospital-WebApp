import jwt from "jsonwebtoken";
import doctorModel from "../model/doctorModel.js";

// Doctor Authentication Middleware
const authDoctor = async (req, res, next) => {
  try {
    const token = req.headers.dtoken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctorId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authDoctor;
