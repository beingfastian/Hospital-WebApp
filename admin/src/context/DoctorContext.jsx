import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [dashData, setDashData] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [profileData, setProfileData] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]); 
  const [doctorData, setDoctorData] = useState(null); 

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        { headers: { dToken } }
      );
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { dToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
        headers: { dToken },
      });
      if (data.success) {
        setProfileData(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // NEW: Leave management functions
  const requestLeave = async (leaveData) => {
    try {
      console.log('Requesting leave with token:', dToken);
      console.log('Leave data:', leaveData);
      
      const { data } = await axios.post(
        backendUrl + "/api/doctor/request-leave",
        leaveData,
        { 
          headers: { 
            dToken,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Leave request response:', data);
      
      if (data.success) {
        toast.success(data.message);
        getLeaveRequests(); // Refresh leave requests
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error requesting leave:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to request leave';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const getLeaveRequests = async () => {
    try {
      console.log('Getting leave requests with token:', dToken);
      
      const { data } = await axios.get(
        backendUrl + "/api/doctor/leave-requests",
        { headers: { dToken } }
      );
      
      console.log('Leave requests response:', data);
      
      if (data.success) {
        setLeaveRequests(data.leaveRequests);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error getting leave requests:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leave requests');
    }
  };

  const cancelLeaveRequest = async (requestId) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/doctor/cancel-leave-request/${requestId}`,
        { headers: { dToken } }
      );
      
      if (data.success) {
        toast.success(data.message);
        getLeaveRequests(); // Refresh leave requests
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    }
  };
   // Get doctor profile data
  const getDoctorProfile = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/get-profile",
        { headers: { dToken } }
      );
      
      if (data.success) {
        setDoctorData(data.doctorData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      toast.error(error.response?.data?.message || "Failed to fetch profile");
    }
  };

    useEffect(() => {
    if (dToken) {
      getDoctorProfile();
    }
  }, [dToken]);

  const value = {
    backendUrl,
    dToken,
    setDToken,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    // Add leave management to context
    leaveRequests,
    setLeaveRequests,
    requestLeave,
    getLeaveRequests,
    cancelLeaveRequest,
    doctorData,
    getDoctorProfile,
  };
  
  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;