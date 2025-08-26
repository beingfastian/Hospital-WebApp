import jwt from "jsonwebtoken";
import doctorModel from "../model/doctorModel.js";

// Enhanced Doctor Authentication Middleware
const authDoctor = async (req, res, next) => {
  try {
    // Check multiple possible header names for token
    const token = req.headers.dtoken || req.headers.dToken || req.headers.authorization?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token received:', !!token);
    console.log('Auth middleware - Headers:', Object.keys(req.headers));
    
    if (!token) {
      console.log('No token provided in headers');
      return res.status(401).json({ 
        success: false, 
        message: "No token provided. Please login again." 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Set doctorId in multiple places for compatibility
      req.doctorId = decoded.id;
      req.body.docId = decoded.id;
      
      // Optionally verify doctor exists in database
      const doctor = await doctorModel.findById(decoded.id);
      if (!doctor) {
        return res.status(401).json({ 
          success: false, 
          message: "Doctor not found. Please login again." 
        });
      }
      
      req.doctor = doctor; // Store doctor data for use in routes
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token. Please login again." 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Authentication error" 
    });
  }
};

export default authDoctor;