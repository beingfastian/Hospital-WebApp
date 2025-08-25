import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import AllAppointments from "./pages/Admin/AllAppointments.jsx";
import AddDoctor from "./pages/Admin/AddDoctor.jsx";
import ManageDoctors from "./pages/Admin/ManageDoctors.jsx";
import AddPatient from "./pages/Admin/AddPatient.jsx";
import ManagePatients from "./pages/Admin/ManagePatients.jsx";
import Settings from "./pages/Admin/Settings.jsx";
import BookAppointmentForPatient from "./pages/Admin/BookAppointmentForPatient.jsx";
import { DoctorContext } from "./context/DoctorContext.jsx";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard.jsx";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments.jsx";
import DoctorProfile from "./pages/Doctor/DoctorProfile.jsx";
import DoctorLeaveRequest from "./pages/Doctor/DoctorLeaveRequest";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  
  return aToken || dToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Appointment Management */}
          <Route path="/all-appointments" element={<AllAppointments />} />
          <Route path="/book-appointment" element={<BookAppointmentForPatient />} />
          
          {/* Doctor Management */}
          <Route path="/doctors" element={<ManageDoctors />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          
          {/* Patient Management */}
          <Route path="/patients" element={<ManagePatients />} />
          <Route path="/add-patient" element={<AddPatient />} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/leave-requests" element={<DoctorLeaveRequest />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  );
};

export default App;