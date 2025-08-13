import React, { useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { FaWhatsapp, FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { assets } from "../../assets/assets.js";

const AddPatient = () => {
  const [patientImage, setPatientImage] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const { backendUrl, aToken } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!patientImage) {
        return toast.error("Patient image not selected");
      }
      
      // Validation
      if (!name || !email || !password || !phone || !dob || !address1) {
        return toast.error("Please fill all required fields");
      }

      if (whatsappEnabled && !whatsappNumber) {
        return toast.error("Please enter WhatsApp number when WhatsApp is enabled");
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("image", patientImage);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }));
      formData.append("whatsappEnabled", whatsappEnabled);
      formData.append("whatsappNumber", whatsappNumber);

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-patient",
        formData,
        {
          headers: {
            aToken,
          },
        }
      );
      
      if (data.success) {
        toast.success(data.message);
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setDob("");
        setGender("Male");
        setAddress1("");
        setAddress2("");
        setWhatsappEnabled(false);
        setWhatsappNumber("");
        setPatientImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="m-5 w-full" onSubmit={(e) => onSubmitHandler(e)}>
      <p className="mb-3 text-xl font-medium">Add Patient</p>
      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="patientImage">
            <img
              src={
                patientImage ? URL.createObjectURL(patientImage) : assets.upload_area
              }
              alt=""
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
            />
          </label>
          <input
            onChange={(e) => setPatientImage(e.target.files[0])}
            type="file"
            id="patientImage"
            className="hidden"
          />
          <p>
            Upload Patient <br />
            Picture
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Patient Name *</p>
              <input
                className="border rounded px-3 py-2 outline-primary"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Patient Email *</p>
              <input
                className="border rounded px-3 py-2 outline-primary"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Password *</p>
              <div className="relative">
                <input
                  className="border rounded px-3 py-2 w-full outline-primary"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Phone Number *</p>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border rounded px-3 py-2 outline-primary"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Date of Birth *</p>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="border rounded px-3 py-2 outline-primary"
                required
              />
            </div>
          </div>
          
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Gender</p>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="border rounded px-3 py-2 outline-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Address Line 1 *</p>
              <input
                type="text"
                placeholder="Address Line 1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className="border rounded px-3 py-2 outline-primary"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Address Line 2</p>
              <input
                type="text"
                placeholder="Address Line 2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="border rounded px-3 py-2 outline-primary"
              />
            </div>
            
            {/* WhatsApp Settings */}
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-green-500 text-xl" />
                  <div>
                    <p className="font-medium text-gray-700">WhatsApp Notifications</p>
                    <p className="text-sm text-gray-500">Enable WhatsApp notifications for this patient</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              {whatsappEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g., +923001234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +92 for Pakistan)</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          className="bg-primary px-10 py-3 mt-6 text-white rounded-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <ClipLoader size={24} color="#ffffff" /> : "Add Patient"}
        </button>
      </div>
    </form>
  );
};

export default AddPatient;