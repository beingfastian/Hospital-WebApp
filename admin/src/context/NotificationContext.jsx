import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import axios from "axios";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(backendUrl);
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, [backendUrl]);
  
  // Join appropriate room based on user type
  useEffect(() => {
    if (!socket) return;
    
    // Get user type and ID
    const aToken = localStorage.getItem("aToken");
    const dToken = localStorage.getItem("dToken");
    
    if (aToken) {
      socket.emit("join", { room: "admin" });
      fetchNotifications("admin");
    } else if (dToken) {
      // For doctors, we'll use a generic room since we don't have doctor ID yet
      socket.emit("join", { room: "doctor" });
      fetchNotifications("doctor");
    }
  }, [socket]);
  
  // Listen for new notifications
  useEffect(() => {
    if (!socket) return;
    
    socket.on("newNotification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.info(notification.title);
    });
    
    return () => {
      socket.off("newNotification");
    };
  }, [socket]);
  
  // Fetch notifications from server
  const fetchNotifications = async (userType) => {
    try {
      const token = localStorage.getItem(userType === "admin" ? "aToken" : "dToken");
      const url = `${backendUrl}/api/notifications/${userType}`;
        
      const { data } = await axios.get(url, {
        headers: { [userType === "admin" ? "atoken" : "dtoken"]: token }
      });
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${backendUrl}/api/notifications/read/${notificationId}`);
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async (userType) => {
    try {
      const url = `${backendUrl}/api/notifications/read-all/${userType}`;
        
      await axios.put(url);
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  
  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${backendUrl}/api/notifications/${notificationId}`);
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};