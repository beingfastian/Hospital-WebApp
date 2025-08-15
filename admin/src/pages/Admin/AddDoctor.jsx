import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets.js";
import { AdminContext } from "../../context/AdminContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { FaEye, FaEyeSlash, FaWhatsapp } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const AddDoctor = () => {
  const [docImage, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [experience, setExperience] = useState("1 Year");
  const [fee, setFee] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  
  // New fields for WhatsApp, timings, and sitting days
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [sittingDays, setSittingDays] = useState([]);
  const [holidays, setHolidays] = useState("");
  
  const { backendUrl, aToken } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
  ];

  // Handle sitting days selection
  const handleDayChange = (day) => {
    setSittingDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // Select all weekdays helper
  const selectWeekdays = () => {
    setSittingDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  };

  // Select all days helper
  const selectAllDays = () => {
    setSittingDays(daysOfWeek.map(day => day.value));
  };

  // Clear all days helper
  const clearAllDays = () => {
    setSittingDays([]);
  };

  // Validate time format and logic
  const validateTimings = () => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    if (start >= end) {
      toast.error("End time must be after start time");
      return false;
    }
    
    // Check for reasonable working hours (at least 1 hour)
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) {
      toast.error("Working hours should be at least 1 hour");
      return false;
    }
    
    return true;
  };

  // Validate WhatsApp number format
  const validateWhatsAppNumber = (number) => {
    // Basic validation for Pakistani numbers
    const cleanNumber = number.replace(/[\s\-\(\)]/g, '');
    const pakistaniNumberRegex = /^(\+92|92|0)?3[0-9]{9}$/;
    return pakistaniNumberRegex.test(cleanNumber);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!docImage) {
        return toast.error("Doctor image not selected");
      }

      // Validate required fields
      if (!name || !email || !password || !fee || !degree || !address1) {
        return toast.error("Please fill all required fields");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return toast.error("Please enter a valid email address");
      }

      // Validate password strength
      if (password.length < 6) {
        return toast.error("Password must be at least 6 characters long");
      }

      // Validate fee
      if (isNaN(fee) || parseFloat(fee) <= 0) {
        return toast.error("Please enter a valid fee amount");
      }

      // Validate timings
      if (!validateTimings()) {
        return;
      }

      // Validate sitting days
      if (sittingDays.length === 0) {
        return toast.error("Please select at least one sitting day");
      }

      // Validate WhatsApp number if enabled
      if (whatsappEnabled) {
        if (!whatsappNumber) {
          return toast.error("Please enter WhatsApp number when WhatsApp is enabled");
        }
        if (!validateWhatsAppNumber(whatsappNumber)) {
          return toast.error("Please enter a valid Pakistani WhatsApp number (e.g., +923001234567)");
        }
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("image", docImage);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fee", Number(fee));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }));
      
      // Add new fields
      formData.append("whatsappEnabled", whatsappEnabled);
      formData.append("whatsappNumber", whatsappNumber);
      formData.append("timings", JSON.stringify({ start: startTime, end: endTime }));
      formData.append("sittingDays", JSON.stringify(sittingDays));
      formData.append("holidays", holidays);

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
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
        setAbout("");
        setPassword("");
        setAddress1("");
        setAddress2("");
        setDegree("");
        setFee("");
        setDocImg(false);
        setWhatsappEnabled(false);
        setWhatsappNumber("");
        setStartTime("09:00");
        setEndTime("17:00");
        setSittingDays([]);
        setHolidays("");
        setShowPassword(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to add doctor");
    } finally {
      setLoading(false);
    }
  };

  // Calculate working hours duration
  const getWorkingHoursDuration = () => {
    if (!startTime || !endTime) return "";
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? `${diffHours} hour(s)` : "Invalid";
  };

  return (
    <form className="m-5 w-full" onSubmit={(e) => onSubmitHandler(e)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xl font-medium">Add Doctor</p>
        <div className="text-sm text-gray-600">
          All fields marked with * are required
        </div>
      </div>
      
      <div className="bg-white px-8 py-8 border rounded w-full max-w-7xl max-h-[85vh] overflow-y-scroll">
        {/* Doctor Image Upload */}
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="docImage">
            <img
              src={
                docImage ? URL.createObjectURL(docImage) : assets.upload_area
              }
              alt=""
              className="w-20 h-20 bg-gray-100 rounded-full cursor-pointer object-cover border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="docImage"
            className="hidden"
            accept="image/*"
          />
          <div>
            <p className="font-medium">Upload Doctor Picture *</p>
            <p className="text-sm text-gray-400">Click to select image (JPG, PNG)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 text-gray-600">
          {/* Personal Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              Personal Information
            </h3>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Doctor Name *</label>
              <input
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter doctor's full name"
                required
              />
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Doctor Email *</label>
              <input
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Doctor Password *</label>
              <div className="relative">
                <input
                  className="border rounded px-3 py-2 w-full outline-primary focus:border-primary transition-colors"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Address Line 1 *</label>
              <input
                type="text"
                placeholder="Street address, building name"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                required
              />
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Address Line 2</label>
              <input
                type="text"
                placeholder="Area, city, postal code"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Professional Information
            </h3>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Speciality *</label>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
              >
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Experience *</label>
              <select
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                {[...Array(15)].map((_, i) => (
                  <option key={i + 1} value={`${i + 1} Year${i > 0 ? 's' : ''}`}>
                    {i + 1} Year{i > 0 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Education *</label>
              <input
                type="text"
                placeholder="e.g., MBBS, MD, FCPS"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                required
              />
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">Consultation Fee (Rs.) *</label>
              <input
                type="number"
                placeholder="Enter fee in Pakistani Rupees"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                min="0"
                step="50"
                required
              />
              <p className="text-xs text-gray-500">Fee per consultation in PKR</p>
            </div>

            {/* About Doctor */}
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium">About Doctor *</label>
              <textarea
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors resize-none"
                placeholder="Write about the doctor's expertise, experience, and qualifications..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-gray-500">{about.length}/500 characters</p>
            </div>
          </div>

          {/* Schedule & Contact Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Schedule & Contact
            </h3>
            
            {/* Working Hours */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Working Hours *</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-600">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border rounded px-3 py-2 outline-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Current: {startTime} - {endTime}</span>
                <span>Duration: {getWorkingHoursDuration()}</span>
              </div>
            </div>

            {/* Sitting Days */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Sitting Days *</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={selectWeekdays}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                >
                  All Days
                </button>
                <button
                  type="button"
                  onClick={clearAllDays}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <label key={day.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={sittingDays.includes(day.value)}
                      onChange={() => handleDayChange(day.value)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Selected: {sittingDays.length} day(s) - {sittingDays.map(day => 
                  daysOfWeek.find(d => d.value === day)?.label
                ).join(', ')}
              </p>
            </div>

            {/* Holiday Information */}
            <div className="flex flex-col gap-1">
              <label className="font-medium">Holiday Information</label>
              <textarea
                placeholder="Enter holiday schedule, annual leave periods, or special notes..."
                value={holidays}
                onChange={(e) => setHolidays(e.target.value)}
                className="border rounded px-3 py-2 outline-primary focus:border-primary transition-colors resize-none"
                rows={2}
              />
              <p className="text-xs text-gray-500">Optional: Eid holidays, annual leave, etc.</p>
            </div>

            {/* WhatsApp Settings */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-green-500 text-xl" />
                  <div>
                    <p className="font-medium text-gray-700">WhatsApp Notifications</p>
                    <p className="text-sm text-gray-500">Enable WhatsApp notifications for this doctor</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              {whatsappEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g., +923001234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary focus:border-green-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code. Format: +92XXXXXXXXXX
                  </p>
                  {whatsappNumber && !validateWhatsAppNumber(whatsappNumber) && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter a valid Pakistani WhatsApp number
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Form Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{name || "Not set"}</p>
            </div>
            <div>
              <span className="text-gray-600">Speciality:</span>
              <p className="font-medium">{speciality}</p>
            </div>
            <div>
              <span className="text-gray-600">Fee:</span>
              <p className="font-medium">Rs. {fee || "0"}</p>
            </div>
            <div>
              <span className="text-gray-600">Working Days:</span>
              <p className="font-medium">{sittingDays.length} day(s)</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-primary px-10 py-3 text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <ClipLoader size={20} color="#ffffff" className="mr-2" />
                Adding Doctor...
              </>
            ) : (
              "Add Doctor"
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure? All entered data will be lost.")) {
                // Reset all fields
                setName("");
                setEmail("");
                setPassword("");
                setFee("");
                setAbout("");
                setDegree("");
                setAddress1("");
                setAddress2("");
                setWhatsappEnabled(false);
                setWhatsappNumber("");
                setStartTime("09:00");
                setEndTime("17:00");
                setSittingDays([]);
                setHolidays("");
                setDocImg(false);
                setShowPassword(false);
              }
            }}
            className="bg-gray-500 px-10 py-3 text-white rounded-full hover:bg-gray-600 transition-colors"
          >
            Reset Form
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddDoctor;