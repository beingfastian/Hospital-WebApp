import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
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
import AdminLeaveManagement from './pages/Admin/AdminLeaveManagement.jsx';
import { NotificationProvider } from "./context/NotificationContext.jsx";
import ForgotPassword from "./pages/Doctor/ForgotPassword";
import VerifyOTP from "./pages/Doctor/VerifyOTP";
import ResetPassword from "./pages/Doctor/ResetPassword";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
    // Debug logging
  console.log("App render - aToken:", aToken, "dToken:", dToken);
  console.log("Should show authenticated?", Boolean(aToken || dToken));
  
  return (
    <BrowserRouter>
      <ToastContainer />
      {aToken || dToken ? (
        <NotificationProvider>
          <div className="bg-[#F8F9FD]">
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
                <Route path="/leave-management" element={<AdminLeaveManagement />} />
              </Routes>
            </div>
          </div>
        </NotificationProvider>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;