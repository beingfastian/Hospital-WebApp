import React from "react";
import { specialityData } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const SpecialityMenu = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-gray-800"
      id="speciality"
    >
      <h1 className="text-3xl font-medium">Find by Speciality</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Browse through our extensive list of trusted doctors by their speciality.
        Contact us via WhatsApp to schedule your appointment.
      </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
        {specialityData.map((item, index) => (
          <div
            onClick={() => {
              navigate(`/doctors/${item.speciality}`);
              scrollTo(0, 0);
            }}
            className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500"
            key={index}
          >
            <img
              className="w-16 sm:w-24 mb-2"
              src={item.image}
              alt={`${item.speciality} image`}
            />
            <p>{item.speciality}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;