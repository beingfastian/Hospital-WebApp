import { createContext, useState } from "react";
import axios from "axios";
export const AdminContext = createContext();
import { toast } from "react-toastify";
import { useEffect } from "react";

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  // Add leave requests state
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveStats, setLeaveStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    thisMonth: 0
  });
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  
  // ================= EXISTING FUNCTIONS (keep all your existing functions) =================
// Doctor CRUD
const getAllDoctors = async () => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/admin/all-doctors",
      {},
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    if (data.success) {
      setDoctors(data.doctors);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

const addDoctor = async (formData) => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/admin/add-doctor",
      formData,
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    return data;
  } catch (error) {
    throw error;
  }
};

const updateDoctor = async (doctorId, updateData) => {
  try {
    const { data } = await axios.put(
      backendUrl + `/api/admin/update-doctor/${doctorId}`,
      updateData,
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    return data;
  } catch (error) {
    throw error;
  }
};

const deleteDoctor = async (doctorId) => {
  try {
    const { data } = await axios.delete(
      backendUrl + `/api/admin/delete-doctor/${doctorId}`,
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    return data;
  } catch (error) {
    throw error;
  }
};

const changeAvailability = async (docId) => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/admin/change-availability",
      { docId },
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    if (data.success) {
      toast.success(data.message);
      getAllDoctors();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Patient CRUD
const getAllPatients = async () => {
  try {
    const { data } = await axios.get(
      backendUrl + "/api/admin/all-patients",
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    if (data.success) {
      setPatients(data.patients);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

const addPatient = async (formData) => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/admin/add-patient",
      formData,
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    return data;
  } catch (error) {
    throw error;
  }
};

const updatePatient = async (patientId, updateData) => {
  try {
    const { data } = await axios.put(
      backendUrl + `/api/admin/update-patient/${patientId}`,
      updateData,
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    return data;
  } catch (error) {
    throw error;
  }
};

const deletePatient = async (patientId) => {
  try {
    const { data } = await axios.delete(
      backendUrl + `/api/admin/delete-patient/${patientId}`,
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    return data;
  } catch (error) {
    throw error;
  }
};

// Appointments
const getAllAppointments = async () => {
  try {
    const { data } = await axios.get(
      backendUrl + "/api/admin/appointments",
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    if (data.success) {
      setAppointments(data.appointments);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

const bookAppointmentForPatient = async (bookingData) => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/admin/book-appointment-for-patient",
      bookingData,
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    return data;
  } catch (error) {
    throw error;
  }
};

// Dashboard
const getDashData = async () => {
  try {
    const { data } = await axios.get(
      backendUrl + "/api/admin/dashboard",
      { headers: { atoken: aToken } }   // ✅ fixed
    );
    if (data.success) {
      setDashData(data.dashData);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Leave Management
// Fixed leave management functions in AdminContext.jsx

const approveLeaveRequest = async (requestId, adminResponse = '') => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/admin/approve-leave",
      { requestId, adminResponse },
      { headers: { atoken: aToken } }
    );
    if (data.success) {
      toast.success(data.message);
      getAllLeaveRequests();
      getLeaveStats();
    } else {
      toast.error(data.message);
    }
    return data;
  } catch (error) {
    console.error('Error approving leave:', error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Failed to approve leave request");
    throw error;
  }
};

const rejectLeaveRequest = async (requestId, adminResponse) => {
  try {
    if (!adminResponse || adminResponse.trim() === '') {
      toast.error('Please provide a reason for rejection');
      return { success: false };
    }

    const { data } = await axios.post(
      backendUrl + "/api/admin/reject-leave",
      { requestId, adminResponse },
      { headers: { atoken: aToken } }
    );
    if (data.success) {
      toast.success(data.message);
      getAllLeaveRequests();
      getLeaveStats();
    } else {
      toast.error(data.message);
    }
    return data;
  } catch (error) {
    console.error('Error rejecting leave:', error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Failed to reject leave request");
    throw error;
  }
};

const getAllLeaveRequests = async () => {
  try {
    const { data } = await axios.get(
      backendUrl + "/api/admin/leave-requests",
      { headers: { atoken: aToken } }
    );
    if (data.success) {
      setLeaveRequests(data.leaveRequests);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Error fetching leave requests:', error.response?.data || error.message);
    toast.error("Failed to fetch leave requests");
  }
};

const getLeaveStats = async () => {
  try {
    const { data } = await axios.get(
      backendUrl + "/api/admin/leave-stats",
      { headers: { atoken: aToken } }
    );
    if (data.success) {
      setLeaveStats(data.stats);
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error('Error fetching leave stats:', error.response?.data || error.message);
  }
};

  const value = {
    aToken,
    setAToken,
    backendUrl,
    
    // Doctor CRUD
    doctors,
    setDoctors,
    getAllDoctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    changeAvailability,
    
    // Patient CRUD
    patients,
    setPatients,
    getAllPatients,
    addPatient,
    updatePatient,
    deletePatient,
    
    // Appointments
    appointments,
    setAppointments,
    getAllAppointments,
    bookAppointmentForPatient,
    
    // Dashboard
    getDashData,
    dashData,

    // Leave Management (NEW)
    leaveRequests,
    setLeaveRequests,
    getAllLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    leaveStats,
    getLeaveStats,
  };
  
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;