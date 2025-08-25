import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  type: { type: String, default: "vacation" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  submittedAt: { type: Date, default: Date.now },
  adminResponse: { type: String }
});

export default mongoose.model("LeaveRequest", leaveRequestSchema);
