import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { assets } from "../../assets/assets.js";
import { toast } from "react-toastify";
import { FaWhatsapp, FaEnvelope, FaUser, FaCalendarAlt, FaSpinner, FaPlus, FaSearch } from "react-icons/fa";
import axios from "axios";

const BookAppointmentForPatient = () => {
  const { aToken, doctors, getAllDoctors, backendUrl, patients, getAllPatients } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  
  // Patient selection state
  const [patientSelectionMode, setPatientSelectionMode] = useState("existing");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);

  // New patient form state (updated without password, added CNIC)
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "", // Added CNIC field
    dob: "",
    gender: "Male",
    address: {
      line1: "",
      line2: ""
    },
    whatsappEnabled: false,
    whatsappNumber: ""
  });

  // Appointment booking state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0); // Added discount

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
      getAllPatients();
    }
  }, [aToken]);

  useEffect(() => {
    if (patientSearchTerm) {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.phone.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        (patient.cnic && patient.cnic.includes(patientSearchTerm))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [patients, patientSearchTerm]);

  // Updated getAvailableSlots for 3 months (current + next 2 months)
  const getAvailableSlots = (doctor) => {
    if (!doctor) return;
    setDocSlots([]);

    let today = new Date();
    
    // Extend to next 3 months instead of just current month
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Extended to 3 months
    endDate.setDate(0); // Last day of the third month

    if (today.getHours() >= 20) {
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();
      if (today.getDate() === lastDayOfMonth) {
        today.setMonth(today.getMonth() + 1, 1);
      } else {
        today.setDate(today.getDate() + 1);
      }
      today.setHours(10, 0, 0, 0);
    }

    // Calculate total days to show (approximately 90 days for 3 months)
    const totalDays = Math.floor((endDate - today) / (1000 * 60 * 60 * 24)) + 1;
    const daysToShow = Math.min(totalDays, 90); // Cap at 90 days

    for (let i = 0; i < daysToShow; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      // Check if doctor is available on this day
      const dayOfWeek = currentDate.getDay();
      const dayName = daysOfWeek[dayOfWeek].toLowerCase();
      
      // Skip if doctor is not available on this day (based on sitting days)
      if (doctor.sittingDays && !doctor.sittingDays.includes(dayName)) {
        continue;
      }

      // Check if doctor is on leave on this date
      const dateStr = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`;
      if (doctor.leaveRequests && doctor.leaveRequests.some(leave => 
        leave.status === 'approved' && isDateInRange(currentDate, leave.fromDate, leave.toDate)
      )) {
        continue;
      }

      let startTime = new Date(currentDate);
      let endTime = new Date(currentDate);
      
      // Use doctor's timings if available, otherwise default times
      if (doctor.timings) {
        const [startHour, startMin] = doctor.timings.start.split(':');
        const [endHour, endMin] = doctor.timings.end.split(':');
        startTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
        endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
      } else {
        startTime.setHours(10, 0, 0, 0);
        endTime.setHours(21, 0, 0, 0);
      }

      if (today.getDate() === currentDate.getDate() && today.getMonth() === currentDate.getMonth()) {
        const now = new Date();
        if (now.getHours() >= startTime.getHours()) {
          startTime.setHours(now.getHours() + 1, now.getMinutes() > 30 ? 30 : 0, 0, 0);
        }
      }

      let timeSlots = [];
      let tempTime = new Date(startTime);
      
      while (tempTime < endTime) {
        let formattedTime = tempTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        
        const slotDate = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`;
        const isSlotAvailable = 
          doctor.slots_booked[slotDate] && 
          doctor.slots_booked[slotDate].includes(formattedTime) ? false : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(tempTime),
            time: formattedTime,
          });
        }

        tempTime.setMinutes(tempTime.getMinutes() + 30);
      }

      if (timeSlots.length > 0) {
        setDocSlots((prev) => [...prev, timeSlots]);
      }
    }
  };

  // Helper function to check if a date is in leave range
  const isDateInRange = (date, fromDate, toDate) => {
    const checkDate = new Date(date);
    const start = new Date(fromDate);
    const end = new Date(toDate);
    return checkDate >= start && checkDate <= end;
  };

  // CNIC validation function
  const validateCNIC = (cnic) => {
    // Remove any dashes and spaces
    const cleanCNIC = cnic.replace(/[-\s]/g, '');
    
    // Check if it's exactly 13 digits
    if (!/^\d{13}$/.test(cleanCNIC)) {
      return false;
    }
    
    return true;
  };

  const handleNewPatientDataChange = (field, value) => {
    if (field === 'cnic') {
      // Clean CNIC input - remove dashes and limit to numbers only
      const cleanValue = value.replace(/[-\s]/g, '').replace(/\D/g, '');
      if (cleanValue.length <= 13) {
        setNewPatientData(prev => ({ ...prev, [field]: cleanValue }));
      }
      return;
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewPatientData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewPatientData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validatePatientSelection = () => {
    if (patientSelectionMode === "existing") {
      if (!selectedPatient) {
        toast.error("Please select a patient");
        return false;
      }
    } else {
      const { name, email, phone, cnic, dob, address } = newPatientData;
      if (!name || !email || !phone || !cnic || !dob || !address.line1) {
        toast.error("Please fill all required patient fields");
        return false;
      }
      
      if (!validateCNIC(cnic)) {
        toast.error("CNIC must be exactly 13 digits without dashes");
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return false;
      }

      if (newPatientData.whatsappEnabled && !newPatientData.whatsappNumber) {
        toast.error("Please enter WhatsApp number when WhatsApp is enabled");
        return false;
      }
    }
    return true;
  };

  const handleDoctorSelection = (doctor) => {
    setSelectedDoctor(doctor);
    getAvailableSlots(doctor);
    setStep(3);
    setSlotIndex(0);
    setSlotTime("");
  };

  // Calculate discounted fee
  const calculateDiscountedFee = () => {
    if (!selectedDoctor || !discountPercent) return selectedDoctor?.fee || 0;
    const discount = (selectedDoctor.fee * discountPercent) / 100;
    return selectedDoctor.fee - discount;
  };

  const bookAppointment = async () => {
    try {
      if (!selectedDoctor || !slotTime) {
        toast.error("Please select a doctor and time slot");
        return;
      }

      setIsBooking(true);
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;
      const finalFee = calculateDiscountedFee();

      const bookingData = {
        patientSelectionMode,
        selectedPatientId: selectedPatient?._id || null,
        newPatientData: patientSelectionMode === "new" ? newPatientData : null,
        docId: selectedDoctor._id,
        slotDate,
        slotTime,
        discountPercent: discountPercent || 0,
        finalFee: finalFee
      };

      const { data } = await axios.post(
        backendUrl + "/api/admin/book-appointment-for-patient",
        bookingData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        
        const patientData = selectedPatient || newPatientData;
        if (patientData.whatsappEnabled) {
          toast.info("WhatsApp confirmation will be sent to patient!", {
            icon: <FaWhatsapp className="text-green-500" />
          });
        } else {
          toast.info("Email confirmation will be sent to patient!", {
            icon: <FaEnvelope className="text-blue-500" />
          });
        }
        
        // Reset form
        setSelectedPatient(null);
        setNewPatientData({
          name: "",
          email: "",
          phone: "",
          cnic: "",
          dob: "",
          gender: "Male",
          address: { line1: "", line2: "" },
          whatsappEnabled: false,
          whatsappNumber: ""
        });
        setSelectedDoctor(null);
        setStep(1);
        setSlotTime("");
        setDiscountPercent(0);
        setPatientSelectionMode("existing");
        getAllDoctors();
        getAllPatients();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setNewPatientData({
      name: "",
      email: "",
      phone: "",
      cnic: "",
      dob: "",
      gender: "Male",
      address: { line1: "", line2: "" },
      whatsappEnabled: false,
      whatsappNumber: ""
    });
    setSelectedDoctor(null);
    setStep(1);
    setSlotTime("");
    setDiscountPercent(0);
    setPatientSelectionMode("existing");
  };

  const getSelectedPatientData = () => {
    return patientSelectionMode === "existing" ? selectedPatient : newPatientData;
  };

  return (
    <div className="m-5 max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Book Appointment for Patient</h1>
        {step > 1 && (
          <button
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <FaUser />
          </div>
          <span className="ml-2 font-medium">Select Patient</span>
        </div>
        <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <FaUser />
          </div>
          <span className="ml-2 font-medium">Select Doctor</span>
        </div>
        <div className={`w-16 h-0.5 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <FaCalendarAlt />
          </div>
          <span className="ml-2 font-medium">Select Time</span>
        </div>
      </div>

      {/* Step 1: Patient Selection */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-medium mb-4">Select Patient</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setPatientSelectionMode("existing")}
              className={`px-4 py-2 rounded-full border transition-all ${
                patientSelectionMode === "existing" 
                  ? "bg-primary text-white border-primary" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              Select Existing Patient
            </button>
            <button
              onClick={() => setPatientSelectionMode("new")}
              className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                patientSelectionMode === "new" 
                  ? "bg-primary text-white border-primary" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <FaPlus /> Add New Patient
            </button>
          </div>

          {/* Existing Patient Selection */}
          {patientSelectionMode === "existing" && (
            <div>
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients by name, email, phone, or CNIC..."
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedPatient?._id === patient._id 
                        ? "border-primary bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.image}
                        alt={patient.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                        {patient.cnic && (
                          <p className="text-sm text-gray-500">CNIC: {patient.cnic}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {calculateAge(patient.dob)} years, {patient.gender}
                          </span>
                          {patient.whatsappEnabled && (
                            <FaWhatsapp className="text-green-500 text-sm" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {patientSearchTerm ? "No patients found matching your search." : "No patients available."}
                </div>
              )}
            </div>
          )}

          {/* New Patient Form */}
          {patientSelectionMode === "new" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newPatientData.name}
                  onChange={(e) => handleNewPatientDataChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newPatientData.email}
                  onChange={(e) => handleNewPatientDataChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newPatientData.phone}
                  onChange={(e) => handleNewPatientDataChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNIC (13 digits) *
                </label>
                <input
                  type="text"
                  value={newPatientData.cnic}
                  onChange={(e) => handleNewPatientDataChange('cnic', e.target.value)}
                  placeholder="e.g., 1234567890123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  maxLength="13"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 13 digits without dashes ({newPatientData.cnic.length}/13)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={newPatientData.dob}
                  onChange={(e) => handleNewPatientDataChange('dob', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={newPatientData.gender}
                  onChange={(e) => handleNewPatientDataChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={newPatientData.address.line1}
                  onChange={(e) => handleNewPatientDataChange('address.line1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={newPatientData.address.line2}
                  onChange={(e) => handleNewPatientDataChange('address.line2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>

              {/* WhatsApp Settings for New Patient */}
              <div className="md:col-span-2 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FaWhatsapp className="text-green-500 text-xl" />
                    <div>
                      <p className="font-medium text-gray-700">WhatsApp Notifications</p>
                      <p className="text-sm text-gray-500">Send appointment confirmations via WhatsApp</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPatientData.whatsappEnabled}
                      onChange={(e) => handleNewPatientDataChange('whatsappEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                
                {newPatientData.whatsappEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={newPatientData.whatsappNumber}
                      onChange={(e) => handleNewPatientDataChange('whatsappNumber', e.target.value)}
                      placeholder="e.g., +923001234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +92 for Pakistan)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => {
                if (validatePatientSelection()) {
                  setStep(2);
                }
              }}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark"
            >
              Next: Select Doctor
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Doctor Selection */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-medium mb-4">Select Doctor</h2>
          
          {/* Selected Patient Summary */}
          {getSelectedPatientData() && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Selected Patient: {getSelectedPatientData().name}
              </h4>
              <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                <span>Email: {getSelectedPatientData().email}</span>
                <span>Phone: {getSelectedPatientData().phone}</span>
                {getSelectedPatientData().cnic && (
                  <span>CNIC: {getSelectedPatientData().cnic}</span>
                )}
                <span>Age: {calculateAge(getSelectedPatientData().dob)} years</span>
                <span className="flex items-center gap-1">
                  {getSelectedPatientData().whatsappEnabled ? (
                    <>
                      <FaWhatsapp className="text-green-500" />
                      WhatsApp Enabled
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="text-blue-500" />
                      Email Only
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.filter(doc => doc.available).map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => handleDoctorSelection(doctor)}
                className="border border-blue-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary"
              >
                <img
                  className="w-full h-40 object-cover rounded-lg bg-blue-50"
                  src={doctor.image}
                  alt={doctor.name}
                />
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Available</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.speciality}</p>
                  <p className="text-sm text-primary font-medium mt-1">
                    Rs. {doctor.fee}
                  </p>
                  {doctor.timings && (
                    <p className="text-xs text-gray-500 mt-1">
                      {doctor.timings.start} - {doctor.timings.end}
                    </p>
                  )}
                  {doctor.sittingDays && (
                    <p className="text-xs text-gray-500">
                      Days: {doctor.sittingDays.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Time Slot Selection */}
      {step === 3 && selectedDoctor && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Select Appointment Time</h2>
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Change Doctor
            </button>
          </div>

          {/* Selected Doctor Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <img
              className="w-16 h-16 rounded-full object-cover"
              src={selectedDoctor.image}
              alt={selectedDoctor.name}
            />
            <div>
              <h3 className="font-medium text-gray-900">{selectedDoctor.name}</h3>
              <p className="text-sm text-gray-600">{selectedDoctor.speciality}</p>
              <p className="text-sm text-primary font-medium">Fee: Rs. {selectedDoctor.fee}</p>
              {selectedDoctor.whatsappNumber && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <FaWhatsapp /> {selectedDoctor.whatsappNumber}
                </p>
              )}
            </div>
          </div>

          {/* Patient Summary */}
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Patient: {getSelectedPatientData().name}</h4>
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
              <span>Age: {calculateAge(getSelectedPatientData().dob)} years</span>
              <span>Gender: {getSelectedPatientData().gender}</span>
              <span>Phone: {getSelectedPatientData().phone}</span>
              <span className="flex items-center gap-1">
                {getSelectedPatientData().whatsappEnabled ? (
                  <>
                    <FaWhatsapp className="text-green-500" />
                    WhatsApp Enabled
                  </>
                ) : (
                  <>
                    <FaEnvelope className="text-blue-500" />
                    Email Only
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Discount Section */}
          <div className="p-4 bg-yellow-50 rounded-lg mb-6 border border-yellow-200">
            <h4 className="font-medium text-gray-900 mb-3">Apply Discount (Optional)</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  placeholder="Enter discount %"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Fee
                </label>
                <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                  <span className="text-lg font-medium text-green-600">
                    Rs. {calculateDiscountedFee()}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Rs. {(selectedDoctor.fee * discountPercent / 100).toFixed(0)} off)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-4">
            <p className="font-medium text-gray-700 mb-3">Select Date</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {docSlots.length &&
                docSlots.map((item, index) => (
                  <div
                    key={index}
                    className={`text-center py-4 px-3 min-w-16 rounded-lg cursor-pointer border-2 transition-all ${
                      slotIndex === index
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSlotIndex(index);
                      setSlotTime("");
                    }}
                  >
                    {item.length > 0 && (
                      <>
                        <p className="text-sm font-medium">{daysOfWeek[item[0].datetime.getDay()]}</p>
                        <p className="text-lg">{item[0].datetime.getDate()}</p>
                        <p className="text-xs">{item[0].datetime.toLocaleDateString('en-US', { month: 'short' })}</p>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <p className="font-medium text-gray-700 mb-3">Select Time</p>
            <div className="flex flex-wrap gap-3">
              {docSlots.length &&
                docSlots[slotIndex].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSlotTime(item.time)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      item.time === slotTime
                        ? "bg-primary text-white border-primary"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {item.time.toLowerCase()}
                  </button>
                ))}
            </div>
          </div>

          {/* Booking Summary & Confirm Button */}
          {slotTime && (
            <div className="border-t pt-6">
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Patient:</strong> {getSelectedPatientData().name}</p>
                  <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                  <p><strong>Date & Time:</strong> {docSlots[slotIndex][0] && slotDateFormat(
                    `${docSlots[slotIndex][0].datetime.getDate()}_${docSlots[slotIndex][0].datetime.getMonth() + 1}_${docSlots[slotIndex][0].datetime.getFullYear()}`
                  )} at {slotTime}</p>
                  <p><strong>Original Fee:</strong> Rs. {selectedDoctor.fee}</p>
                  {discountPercent > 0 && (
                    <p><strong>Discount:</strong> {discountPercent}% (Rs. {(selectedDoctor.fee * discountPercent / 100).toFixed(0)})</p>
                  )}
                  <p><strong>Final Fee:</strong> Rs. {calculateDiscountedFee()}</p>
                  <p className="flex items-center gap-1">
                    <strong>Notification:</strong>
                    {getSelectedPatientData().whatsappEnabled ? (
                      <>
                        <FaWhatsapp className="text-green-500" />
                        WhatsApp & Email
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="text-blue-500" />
                        Email Only
                      </>
                    )}
                  </p>
                  {patientSelectionMode === "new" && (
                    <p className="text-blue-600"><strong>Note:</strong> New patient account will be created</p>
                  )}
                </div>
              </div>

              <button
                onClick={bookAppointment}
                disabled={isBooking}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isBooking ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    Booking Appointment...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAppointmentForPatient;