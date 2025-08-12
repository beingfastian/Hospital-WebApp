import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { assets } from "../../assets/assets.js";
import { FaWhatsapp, FaEnvelope, FaFilter } from "react-icons/fa";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNotification, setFilterNotification] = useState("all");

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  const filteredAppointments = appointments.filter(item => {
    if (filterStatus !== "all") {
      if (filterStatus === "cancelled" && !item.cancelled) return false;
      if (filterStatus === "completed" && item.isCompleted === false) return false;
      if (filterStatus === "pending" && (item.cancelled || item.isCompleted)) return false;
    }
    
    if (filterNotification !== "all") {
      if (filterNotification === "whatsapp" && !item.userData?.whatsappEnabled) return false;
      if (filterNotification === "email" && item.userData?.whatsappEnabled) return false;
    }
    
    return true;
  });

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded border mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-1 text-sm outline-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select 
              value={filterNotification} 
              onChange={(e) => setFilterNotification(e.target.value)}
              className="border rounded px-3 py-1 text-sm outline-primary"
            >
              <option value="all">All Notifications</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email Only</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <FaWhatsapp className="text-green-500" />
              {appointments.filter(a => a.userData?.whatsappEnabled).length} WhatsApp
            </span>
            <span className="text-gray-400">|</span>
            <span>Total: {appointments.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] grid-flow-col py-3 px-6 border-b bg-gray-50 font-medium">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor Name</p>
          <p>Fee</p>
          <p>Notif</p>
          <p>Action</p>
        </div>
        {filteredAppointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <div>
                <p className="text-gray-800">{item.userData.name}</p>
                {item.userData.whatsappEnabled && (
                  <p className="text-xs text-green-600">{item.userData.whatsappNumber}</p>
                )}
              </div>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={item.docData.image}
                alt=""
              />
              <p>{item.docData.name}</p>
            </div>
            <p>{currency} {item.docData.fee}</p>
            <div className="flex items-center gap-1">
              {item.userData?.whatsappEnabled ? (
                <FaWhatsapp className="text-green-500" title="WhatsApp" />
              ) : (
                <FaEnvelope className="text-blue-500" title="Email" />
              )}
            </div>
            {item.cancelled ? (
              <p className="text-red-400 text-sm font-medium">Cancelled</p>
            ) : !item.isCompleted ? (
              <img
                src={assets.cancel_icon}
                onClick={() => cancelAppointment(item._id)}
                className="w-10 cursor-pointer"
                alt=""
              />
            ) : (
              <p className="text-green-400 text-sm font-medium">Completed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
