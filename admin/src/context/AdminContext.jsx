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
  // Add fallback to localhost:4000 if env variable is not defined
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  
  // ================= DOCTOR CRUD OPERATIONS =================
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        console.error(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  
  const addDoctor = async (formData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateDoctor = async (doctorId, updateData) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/api/admin/update-doctor/${doctorId}`,
        updateData,
        { headers: { aToken } }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteDoctor = async (doctorId) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/delete-doctor/${doctorId}`,
        { headers: { aToken } }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        console.error(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // ================= PATIENT CRUD OPERATIONS =================
  const getAllPatients = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/all-patients", {
        headers: { aToken },
      });
      if (data.success) {
        setPatients(data.patients);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const addPatient = async (formData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-patient",
        formData,
        { headers: { aToken } }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updatePatient = async (patientId, updateData) => {
    try {
      const { data } = await axios.put(
        backendUrl + `/api/admin/update-patient/${patientId}`,
        updateData,
        { headers: { aToken } }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deletePatient = async (patientId) => {
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/delete-patient/${patientId}`,
        { headers: { aToken } }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // ================= APPOINTMENT OPERATIONS =================
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { aToken },
      });
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Book appointment for patient function
  const bookAppointmentForPatient = async (bookingData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/book-appointment-for-patient",
        bookingData,
        { headers: { aToken } }
      );
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // ================= DASHBOARD =================
  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
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
  };
  
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;