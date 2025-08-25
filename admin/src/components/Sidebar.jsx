import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { DoctorContext } from "../context/DoctorContext.jsx";
import { FaCog, FaUserPlus, FaUsers, FaUserMd, FaEdit } from "react-icons/fa";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  
  return (
    <div className="min-h-screen bg-white border-r">
      {aToken && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/"}
          >
            <img src={assets.home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>
          
          {/* Appointments Section */}
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/all-appointments"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">View Appointments</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/book-appointment"}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <FaUserPlus className="text-xl text-gray-600" />
            </div>
            <p className="hidden md:block">Book for Patient</p>
          </NavLink>

          {/* Doctors Management Section */}
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/doctors"}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <FaUserMd className="text-xl text-gray-600" />
            </div>
            <p className="hidden md:block">Manage Doctors</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/add-doctor"}
          >
            <img src={assets.add_icon} alt="" />
            <p className="hidden md:block">Add Doctor</p>
          </NavLink>

          {/* Patients Management Section */}
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/patients"}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <FaUsers className="text-xl text-gray-600" />
            </div>
            <p className="hidden md:block">Manage Patients</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/add-patient"}
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Add Patient</p>
          </NavLink>

          {/* Settings */}
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/settings"}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <FaCog className="text-xl text-gray-600" />
            </div>
            <p className="hidden md:block">Settings</p>
          </NavLink>
        </ul>
      )}
      {dToken && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            end
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/doctor/"}
          >
            <img src={assets.home_icon} alt="" />
            <p className="hidden md:block">Dashboard</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/doctor/appointments"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">Manage Appointments</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/doctor/profile"}
          >
            <img src={assets.people_icon} alt="" />
            <p className="hidden md:block">Profile</p>
          </NavLink>
          {/* Add Leave Requests link for doctor */}
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary " : ""
              }`
            }
            to={"/doctor/leave-requests"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p className="hidden md:block">Leave Requests</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;