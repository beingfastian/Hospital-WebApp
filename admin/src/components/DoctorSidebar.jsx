import React, { useContext, useState } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { 
  FaChartBar,
  FaCalendarAlt,
  FaUserMd,
  FaCalendarCheck,
  FaBars,
  FaStethoscope
} from "react-icons/fa";

const DoctorSidebar = () => {
  const { dToken } = useContext(DoctorContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Navigation items for Doctor based on your existing structure
  const doctorNavItems = [
    { 
      path: "/doctor/", 
      icon: assets.home_icon, 
      label: "Dashboard",
      end: true 
    },
    { 
      path: "/doctor/appointments", 
      icon: assets.appointment_icon, 
      label: "Manage Appointments" 
    },
    { 
      path: "/doctor/profile", 
      icon: assets.people_icon, 
      label: "Profile" 
    },
    { 
      path: "/doctor/leave-requests", 
      icon: assets.appointment_icon, 
      label: "Leave Requests" 
    }
  ];

  const renderNavItem = (item, index) => (
    <NavLink
      key={index}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 py-2.5 px-4 mx-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? "bg-indigo-500 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
      to={item.path}
    >
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {typeof item.icon === 'string' ? (
          <img src={item.icon} alt="" className="w-5 h-5" />
        ) : (
          item.icon
        )}
      </div>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </NavLink>
  );

  // Only render if doctor is authenticated
  if (!dToken) return null;

  return (
    <div className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-200 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      
      {/* Header - Fixed height */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 h-16 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm">
              <FaStethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Doctor Panel</h2>
              <p className="text-xs text-gray-500">Medical Practice</p>
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

      {/* User Info - Fixed height */}
      {!isCollapsed && (
        <div className="p-4 bg-indigo-50 border-b border-gray-100 h-20 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
              D
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-900">Dr. User</p>
              <p className="text-xs text-indigo-600">Specialist Doctor</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
          </div>
        </div>
      )}

      {/* Navigation - Scrollable area */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {doctorNavItems.map((item, index) => renderNavItem(item, index))}
        </nav>
        
        {/* Quick Stats - Only when expanded */}
        {!isCollapsed && (
          <div className="mx-4 mt-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Today's Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Appointments</span>
                <span className="text-xs font-medium text-gray-900">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Patients</span>
                <span className="text-xs font-medium text-gray-900">6</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Pending</span>
                <span className="text-xs font-medium text-orange-600">2</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed height */}
      <div className="border-t border-gray-100 p-4 h-16 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Online</span>
            </div>
            <span className="text-xs text-gray-400">v2.1.0</span>
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

export default DoctorSidebar;