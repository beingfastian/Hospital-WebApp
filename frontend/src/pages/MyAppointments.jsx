import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import axios from "axios";

const MyAppointments = () => {
  const { token, backendUrl, getDoctorsData, userData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
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

  const getUsersAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUsersAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUsersAppointments();
      getDoctorsData();
    }
  }, [token]);
  
  return (
    <div>
      <div className="flex items-center justify-between pb-3 mt-12 border-b">
        <p className="font-medium text-zin-700">My Appointments</p>
        {userData?.whatsappEnabled && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <FaWhatsapp />
            <span>WhatsApp notifications active</span>
          </div>
        )}
      </div>
      
      {/* WhatsApp Quick Commands Info */}
      {userData?.whatsappEnabled && appointments.length > 0 && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-700 flex items-center gap-2">
            <FaWhatsapp className="text-green-500" />
            Manage appointments via WhatsApp: Send <span className="font-mono bg-white px-2 py-0.5 rounded">STATUS</span> or <span className="font-mono bg-white px-2 py-0.5 rounded">CANCEL</span> to {userData.whatsappNumber}
          </p>
        </div>
      )}
      
      <div>
        {appointments.length !== 0 ? (
          appointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={item.docData.image}
                  alt=""
                />
              </div>
              <div className="flex-1 text-md text-zinc-600">
                <p className="font-medium text-neutral-800">
                  {item.docData.name}
                </p>
                <p>{item.docData.speciality}</p>
                <p className="font-semibold text-zinc-700 mt-1">Address:</p>
                <p className="text-sm">{item.docData.address.line1}</p>
                <p className="text-sm">{item.docData.address.line2}</p>
                <p className="text-sm mt-1">
                  <span className="text-md text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="text-md text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    Cancel Appointment
                  </button>
                )}
                {item.cancelled && !item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-red-500  rounded text-red-500 cursor-not-allowed">
                    Appointment Cancelled
                  </button>
                )}
                {item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-green-500  rounded text-green-500 cursor-not-allowed">
                    Appointment Completed
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="text-center text-2xl text-zinc-600 mt-4">
              No appointments found.
            </div>
            <div className="flex text-center sm:flex-col flex-row">
              <p className="mt-4 text-indigo-600 text-xl">
                Please Book an Appointment
              </p>
              <div>
                <button
                  className="mt-4 border py-4 px-6 rounded bg-primary text-white"
                  onClick={() => navigate("/doctors")}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
