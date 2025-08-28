import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { DoctorContext } from "../context/DoctorContext.jsx";
import { 
  FaCog, 
  FaUserPlus, 
  FaUsers, 
  FaUserMd, 
  FaCalendarCheck, 
  FaChartBar,
  FaStethoscope,
  FaUserInjured,
  FaCalendarAlt,
  FaBars
} from "react-icons/fa";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Simplified navigation items for Admin
  const adminNavItems = [
    { path: "/", icon: <FaChartBar />, label: "Dashboard" },
    { path: "/all-appointments", icon: <FaCalendarAlt />, label: "Appointments" },
    { path: "/book-appointment", icon: <FaUserPlus />, label: "Book Appointment" },
    { path: "/doctors", icon: <FaUserMd />, label: "Doctors" },
    { path: "/add-doctor", icon: <FaStethoscope />, label: "Add Doctor" },
    { path: "/patients", icon: <FaUsers />, label: "Patients" },
    { path: "/add-patient", icon: <FaUserInjured />, label: "Add Patient" },
    { path: "/leave-management", icon: <FaCalendarCheck />, label: "Leave Management" },
    { path: "/settings", icon: <FaCog />, label: "Settings" }
  ];

  // Simplified navigation items for Doctor
  const doctorNavItems = [
    { path: "/doctor/", icon: <FaChartBar />, label: "Dashboard", end: true },
    { path: "/doctor/appointments", icon: <FaCalendarAlt />, label: "Appointments" },
    { path: "/doctor/profile", icon: <FaUserMd />, label: "Profile" },
    { path: "/doctor/leave-requests", icon: <FaCalendarCheck />, label: "Leave Requests" }
  ];

  const renderNavItem = (item, index) => (
    <NavLink
      key={index}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 py-2.5 px-4 mx-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? "bg-blue-500 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
      to={item.path}
    >
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {item.icon}
      </div>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </NavLink>
  );

  return (
    <div className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-200 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      
      {/* Header - Fixed height */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 h-16 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${
              aToken ? "bg-blue-500" : "bg-indigo-500"
            }`}>
              {aToken ? 'A' : 'D'}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {aToken ? "Admin" : "Doctor"}
              </h2>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <FaBars className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation - Scrollable area */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {aToken && adminNavItems.map((item, index) => renderNavItem(item, index))}
          {dToken && doctorNavItems.map((item, index) => renderNavItem(item, index))}
        </nav>
      </div>

      {/* Footer - Fixed height */}
      <div className="border-t border-gray-100 p-4 h-16 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-500">System Online</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;