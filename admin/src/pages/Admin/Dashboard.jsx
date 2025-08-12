import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { aToken, getDashData, dashData, cancelAppointment, backendUrl } =
    useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const [whatsappStats, setWhatsappStats] = useState({
    enabledUsers: 0,
    todayNotifications: 0
  });

  const getWhatsAppStats = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/whatsapp-stats", {
        headers: { aToken }
      });
      if (data.success) {
        setWhatsappStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp stats:", error);
    }
  };

  useEffect(() => {
    if (aToken) {
      getDashData();
      getWhatsAppStats();
    }
  }, [aToken]);

  return (
    dashData && (
      <div className="m-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.doctor_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.doctors}
              </p>
              <p className="text-gray-400">Doctors</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.appointments_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.appointments}
              </p>
              <p className="text-gray-400">Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.patients_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.patients}
              </p>
              <p className="text-gray-400">Patients</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 min-w-52 rounded border-2 border-green-500 cursor-pointer hover:scale-105 transition-all">
            <FaWhatsapp className="text-5xl opacity-90" />
            <div>
              <p className="text-xl font-semibold">
                {whatsappStats.enabledUsers}
              </p>
              <p className="text-green-100">WhatsApp Enabled</p>
              <p className="text-xs text-green-100 mt-1">
                {whatsappStats.todayNotifications} sent today
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex items-center justify-between px-4 py-4 mt-10 rounded-t border">
            <div className="flex items-center gap-2.5">
              <img src={assets.list_icon} alt="" />
              <p className="font-semibold">Latest Bookings</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <FaWhatsapp className="text-green-500" /> WhatsApp
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <FaEnvelope className="text-blue-500" /> Email
              </span>
            </div>
          </div>
          <div className="pt-4 border border-t-0">
            {dashData.latestAppointments.length !== 0 ? (
              dashData.latestAppointments.map((item, index) => (
                <div
                  className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
                  key={index}
                >
                  <img
                    className="rounded-full w-10"
                    src={item.docData.image}
                    alt=""
                  />
                  <div className="flex-1 text-sm">
                    <p className="text-gray-800 font-medium">
                      {item.docData.name}
                    </p>
                    <p className="text-gray-600">
                      Patient: {item.userData.name}
                    </p>
                    <p className="text-gray-600">
                      {slotDateFormat(item.slotDate)}, {item.slotTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.userData.whatsappEnabled && (
                      <FaWhatsapp className="text-green-500" title="WhatsApp enabled" />
                    )}
                    <FaEnvelope className="text-blue-500" title="Email sent" />
                  </div>
                  {item.cancelled ? (
                    <p className="text-red-400 text-sm font-medium">
                      Cancelled
                    </p>
                  ) : !item.isCompleted ? (
                    <img
                      src={assets.cancel_icon}
                      onClick={() => cancelAppointment(item._id)}
                      className="w-10 cursor-pointer"
                      alt=""
                    />
                  ) : (
                    <p className="text-green-400 text-sm font-medium">
                      Completed
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100">
                <h1 className="text-xl font-semibold text-red-500">
                  No Appointments Booked
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
