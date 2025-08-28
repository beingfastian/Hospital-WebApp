import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken, doctorData } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Admin notifications
  const adminNotifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'New Appointment Request',
      message: 'Dr. Smith has requested an appointment slot for tomorrow.',
      time: '5 mins ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'doctor',
      title: 'Doctor Registration',
      message: 'New doctor Dr. Johnson has completed registration.',
      time: '15 mins ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will begin at 2:00 AM.',
      time: '1 hour ago',
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Processed',
      message: 'Payment of $250 has been processed successfully.',
      time: '2 hours ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected.',
      time: '3 hours ago',
      read: false,
      priority: 'high'
    }
  ];

  // Doctor notifications
  const doctorNotifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'New Patient Appointment',
      message: 'John Doe has booked an appointment for 2:00 PM today.',
      time: '10 mins ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'patient',
      title: 'Patient Update',
      message: 'Sarah Wilson has updated her medical history.',
      time: '30 mins ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'leave',
      title: 'Leave Request Update',
      message: 'Your leave request for next week has been approved.',
      time: '1 hour ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 4,
      type: 'schedule',
      title: 'Schedule Change',
      message: 'Your Thursday schedule has been updated.',
      time: '2 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'reminder',
      title: 'Upcoming Appointment',
      message: 'Reminder: You have 3 appointments tomorrow.',
      time: '3 hours ago',
      read: false,
      priority: 'medium'
    }
  ];

  const [notifications, setNotifications] = useState(
    aToken ? adminNotifications : doctorNotifications
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const logout = () => {
    navigate("/");
    aToken && setAToken("");
    dToken && setDToken("");
    aToken && localStorage.removeItem("aToken");
    dToken && localStorage.removeItem("dToken");
    setShowLogoutConfirm(false);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    const iconProps = "w-5 h-5";
    switch(type) {
      case 'appointment':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'doctor':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'patient':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'leave':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
      case 'schedule':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'reminder':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5H15m-6 10v-5a6 6 0 1 0-12 0v5" /></svg>;
      case 'system':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      case 'payment':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
      case 'alert':
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
      default:
        return <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5H15m-6 10v-5a6 6 0 1 0-12 0v5" /></svg>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const userType = aToken ? "Admin" : "Doctor";
  const userName = aToken ? "Administrator" : (doctorData ? doctorData.name : "Dr. User");

  return (
    <>
      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20' 
          : 'bg-white/60 backdrop-blur-sm border-b border-gray-100/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left side - Logo and Brand */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={assets.logo}
                    alt="Logo"
                    className="h-8 w-auto sm:h-10 cursor-pointer transition-transform duration-300 hover:scale-105"
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Brand text - hidden on mobile */}
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    HealthCare
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Management System</p>
                </div>
              </div>
              {/* Role Badge */}
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                aToken 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/50 shadow-sm shadow-emerald-100/50' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm shadow-blue-100/50'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  aToken ? 'bg-emerald-400' : 'bg-blue-400'
                } animate-pulse`}></div>
                {userType}
              </div>
            </div>
            
            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              
              {/* Notifications - Show for both Admin and Doctor */}
              {(aToken || dToken) && (
                <div className="relative notification-dropdown">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl transition-all duration-200 hover:bg-gray-100/50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5H15m-6 10v-5a6 6 0 1 0-12 0v5" />
                    </svg>
                    
                    {/* Notification badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-white/50 z-50 max-h-96 overflow-hidden">
                      
                      {/* Header */}
                      <div className="p-4 border-b border-gray-100/50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
                        </p>
                      </div>
                      
                      {/* Notifications List */}
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-blue-50/30' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                                  notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                      {notification.time}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5H15m-6 10v-5a6 6 0 1 0-12 0v5" />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-sm">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100/50 bg-gray-50/50">
                          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* User Info - hidden on mobile */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-700">{userName}</p>
                <p className="text-xs text-gray-500">Welcome back</p>
              </div>
              
              {/* User Avatar */}
              <div className="relative">
                {dToken && doctorData && doctorData.image ? (
                  <img 
                    src={doctorData.image} 
                    alt="Doctor Profile" 
                    className="w-10 h-10 rounded-full object-cover shadow-lg transition-all duration-300 hover:scale-105"
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200">
                          D
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 ${
                    aToken 
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-200' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
                  }`}>
                    {aToken ? 'A' : 'D'}
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg ${
                  aToken 
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200 hover:shadow-red-300' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-200 hover:shadow-orange-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile user info bar */}
        <div className="md:hidden px-4 pb-3 border-t border-gray-100/50">
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">{userName}</p>
              <p className="text-xs text-gray-500">Welcome back</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-white/50 p-6 w-full max-w-sm mx-auto transform transition-all duration-300">
            
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-sm">Are you sure you want to sign out of your {userType.toLowerCase()} account?</p>
            </div>
            
            {/* Modal Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-red-200"
              >
                Sign Out
              </button>
            </div>
            {/* User Avatar */}
            <div className="relative">
              {dToken && doctorData && doctorData.image ? (
                <img 
                  src={doctorData.image} 
                  alt="Doctor Profile" 
                  className="w-10 h-10 rounded-full object-cover shadow-lg transition-all duration-300 hover:scale-105"
                  onError={(e) => {
                    console.error("Image failed to load:", doctorData.image);
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200">
                        D
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 ${
                  aToken 
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-200' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
                }`}>
                  {aToken ? 'A' : 'D'}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;