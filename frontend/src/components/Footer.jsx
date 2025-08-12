import React from "react";
import { assets } from "../assets/assets";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* Left Section */}
        <div>
          <img src={assets.logo} alt="" className="mb-5 w-40" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            {`Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.`}
          </p>
        </div>
        {/* Center Section */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        {/* Right Section */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+92 3348400517</li>
            <li>Siddiquehospital@gmail.com</li>
            <li className="flex gap-4 mt-2">
              <a
                href="https://www.facebook.com/share/1LVbk5wJp1/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-blue-600 transition-colors"
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.instagram.com/siddique.hospital?igsh=b2I4MTRqYnVnMDdi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-pink-600 transition-colors"
              >
                <FaInstagram />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div>
        {/* Copyright Text */}
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2025@Siddique Hospital - All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;