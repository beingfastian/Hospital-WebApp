import { createContext, useState } from "react";
import axios from "axios";
export const AppContext = createContext();
import { toast } from "react-toastify";
import { useEffect } from "react";

const AppContextProvider = (props) => {
  const currency = "Rs."; // Changed to Pakistani Rupees
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return dateArray[0] + " " + months[dateArray[1]] + " " + dateArray[2];
  };
  
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    return `${currency} ${parseFloat(amount || 0).toLocaleString()}`;
  };

  // Function to calculate discounted amount
  const calculateDiscount = (originalAmount, discountPercent) => {
    const discount = (parseFloat(originalAmount) * parseFloat(discountPercent)) / 100;
    const finalAmount = parseFloat(originalAmount) - discount;
    return {
      originalAmount: parseFloat(originalAmount),
      discountAmount: discount,
      discountPercent: parseFloat(discountPercent),
      finalAmount: finalAmount
    };
  };

  // Function to format doctor availability based on timings and leave
  const getDoctorAvailabilityInfo = (doctor) => {
    if (!doctor.available) {
      return { status: "unavailable", message: "Currently unavailable" };
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check sitting days
    if (doctor.sittingDays && doctor.sittingDays.length > 0) {
      if (!doctor.sittingDays.includes(currentDay)) {
        return { 
          status: "unavailable", 
          message: `Not available on ${currentDay}s`,
          workingDays: doctor.sittingDays
        };
      }
    }

    // Check working hours
    if (doctor.timings) {
      const [startHour, startMin] = doctor.timings.start.split(':').map(Number);
      const [endHour, endMin] = doctor.timings.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      if (currentTime < startTime) {
        return { 
          status: "unavailable", 
          message: `Available from ${doctor.timings.start}`,
          timings: doctor.timings
        };
      }
      
      if (currentTime > endTime) {
        return { 
          status: "unavailable", 
          message: `Clinic closed at ${doctor.timings.end}`,
          timings: doctor.timings
        };
      }
    }

    // Check leave status
    if (doctor.leaveRequests && doctor.leaveRequests.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const currentLeave = doctor.leaveRequests.find(leave => {
        if (leave.status !== 'approved') return false;
        
        const fromDate = new Date(leave.fromDate);
        const toDate = new Date(leave.toDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        return today >= fromDate && today <= toDate;
      });
      
      if (currentLeave) {
        const returnDate = new Date(currentLeave.toDate);
        returnDate.setDate(returnDate.getDate() + 1);
        return { 
          status: "on-leave", 
          message: "On leave",
          returnDate: returnDate.toLocaleDateString(),
          leaveInfo: currentLeave
        };
      }
    }

    return { status: "available", message: "Available now" };
  };

  // Function to format working hours for display
  const formatWorkingHours = (timings) => {
    if (!timings) return "Contact for timings";
    
    const formatTime = (time) => {
      const [hour, minute] = time.split(':');
      const hourNum = parseInt(hour);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      return `${displayHour}:${minute} ${ampm}`;
    };
    
    return `${formatTime(timings.start)} - ${formatTime(timings.end)}`;
  };

  // Function to format sitting days
  const formatSittingDays = (sittingDays) => {
    if (!sittingDays || sittingDays.length === 0) {
      return "Contact for schedule";
    }
    
    const dayNames = {
      'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed',
      'thursday': 'Thu', 'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'
    };
    
    return sittingDays.map(day => dayNames[day]).join(', ');
  };

  const value = {
    calculateAge,
    slotDateFormat,
    currency,
    formatCurrency,
    calculateDiscount,
    getDoctorAvailabilityInfo,
    formatWorkingHours,
    formatSittingDays
  };
  
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;