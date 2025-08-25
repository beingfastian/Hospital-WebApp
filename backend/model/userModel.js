import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cnic: { type: String, unique: true, sparse: true }, // Unique CNIC for admin patients
  phone: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  gender: { type: String, default: "Male" },
  address: { type: Object, required: true },
  image: { type: String },
  whatsappEnabled: { type: Boolean, default: false },
  whatsappNumber: { type: String, default: "" },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;