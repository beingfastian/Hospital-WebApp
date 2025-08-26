import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
  doctorId: { 
    type: String, // Changed from ObjectId to String to match your existing pattern
    required: true 
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["vacation", "sick", "emergency", "personal", "other"],
    default: "vacation" 
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  submittedAt: { type: Date, default: Date.now },
  adminResponse: { type: String },
  approvedBy: { type: String }, // Admin ID who approved/rejected
  approvedAt: { type: Date }
});

// Add indexes for better query performance
leaveRequestSchema.index({ doctorId: 1, fromDate: 1, toDate: 1 });
leaveRequestSchema.index({ status: 1 });

const leaveRequestModel = mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", leaveRequestSchema);

export default leaveRequestModel;