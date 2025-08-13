import React, { useState } from "react";
import { assets } from "../assets/assets.js";
import { NavLink } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);

  // WhatsApp number and message for appointment requests
  const whatsappNumber = "+923348400517"; // Replace with your hospital's WhatsApp number
  const whatsappMessage = "Hello! I would like to request an appointment. Please provide me with available times.";
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex items-center justify-between text-lg py-4 mb-5 border-b border-b-gray-400">
      <img
        src={assets.logo}
        alt="Logo"
        className="w-44 cursor-pointer"
      />
      
      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">Home</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">Our Doctors</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">About</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">Contact</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>

      {/* Request Appointment Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium hidden md:flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
        >
          <FaWhatsapp className="text-lg" />
          Request Appointment
        </button>

        {/* Mobile Menu Button */}
        <img
          onClick={() => setShowMenu(true)}
          src={assets.menu_icon}
          className="w-6 md:hidden"
          alt="Menu"
        />

        {/* Mobile Menu */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "w-0 h-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img
              onClick={() => setShowMenu(false)}
              className="w-7"
              src={assets.cross_icon}
              alt="Close"
            />
          </div>
          <ul className="flex flex-col items-start gap-2 mt-5 px-2 text-lg font-medium">
            <NavLink
              className="border w-full px-4 py-2 border-zinc-200 rounded-lg"
              to={"/"}
              onClick={() => setShowMenu(false)}
            >
              Home
            </NavLink>
            <NavLink
              className="border w-full px-4 py-2 border-zinc-200 rounded-lg"
              to={"/doctors"}
              onClick={() => setShowMenu(false)}
            >
              Our Doctors
            </NavLink>
            <NavLink
              className="border w-full px-4 py-2 border-zinc-200 rounded-lg"
              to={"/about"}
              onClick={() => setShowMenu(false)}
            >
              About
            </NavLink>
            <NavLink
              className="border w-full px-4 py-2 border-zinc-200 rounded-lg"
              to={"/contact"}
              onClick={() => setShowMenu(false)}
            >
              Contact
            </NavLink>
            <button
              onClick={() => {
                handleWhatsAppClick();
                setShowMenu(false);
              }}
              className="bg-green-500 text-white w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <FaWhatsapp />
              Request Appointment
            </button>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;