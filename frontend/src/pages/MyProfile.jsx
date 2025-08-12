// ================================================
// UPDATED: frontend/src/pages/MyProfile.jsx
// ================================================
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaWhatsapp } from "react-icons/fa";

const MyProfile = () => {
  const { userData, setUserData, backendUrl, token, loadUserProfileData } =
    useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(userData?.whatsappEnabled || false);
  const [whatsappNumber, setWhatsappNumber] = useState(userData?.whatsappNumber || userData?.phone || "");

  const updateUserProfileData = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("dob", userData.dob);
      formData.append("gender", userData.gender);
      formData.append("whatsappEnabled", whatsappEnabled);
      formData.append("whatsappNumber", whatsappNumber);
      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    userData && (
      <div className="max-w-lg flex flex-col gap-2 text-md">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img
                src={image ? URL.createObjectURL(image) : userData.image}
                alt=""
                className="w-36 rounded opacity-75"
              />
              <img
                src={image ? "" : assets.upload_icon}
                alt=""
                className="w-10 absolute bottom-12 right-12"
              />
            </div>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <img className="w-36 rounded" src={userData.image} alt="" />
        )}
        {isEdit ? (
          <input
            type="text"
            className="bg-gray-50 text-3xl font-medium max-w-60 mt-4 outline-primary"
            value={userData.name}
            spellCheck={false}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        ) : (
          <p className="font-medium text-3xl text-neutral-800 mt-4">
            {userData.name}
          </p>
        )}
        <hr className="bg-zinc-400 h-[1px] border-none" />
        <div>
          <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email Id:</p>
            <p className="text-blue-500">{userData.email}</p>
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                type="tel"
                className="bg-gray-100 max-w-52 outline-primary"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            ) : (
              <p className="text-blue-500">{userData.phone}</p>
            )}
            <p className="font-medium">Address:</p>
            {isEdit ? (
              <p>
                <input
                  type="text"
                  className="bg-gray-50 outline-primary"
                  value={userData.address.line1}
                  spellCheck={false}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                />
                <br />
                <input
                  type="text"
                  value={userData.address.line2}
                  className="bg-gray-50 outline-primary"
                  spellCheck={false}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                />
              </p>
            ) : (
              <p className="text-gray-500">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
                value={userData.gender}
                className="max-w-20 bg-gray-100 outline-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-400">{userData.gender}</p>
            )}
            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                type="date"
                value={userData.dob}
                className="max-w-28 bg-gray-100 outline-primary"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
              />
            ) : (
              <p className="text-gray-400">{userData.dob}</p>
            )}
          </div>
        </div>
        
        {/* WhatsApp Settings Section */}
        <div className="mt-4">
          <p className="text-neutral-500 underline mt-3">WHATSAPP NOTIFICATIONS</p>
          <div className="mt-3 bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <FaWhatsapp className="text-green-500 text-2xl" />
              <div className="flex-1">
                <p className="font-medium text-neutral-700">WhatsApp Updates</p>
                <p className="text-sm text-gray-500">Receive appointment confirmations and reminders on WhatsApp</p>
              </div>
              {isEdit ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm ${whatsappEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {whatsappEnabled ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>
            
            {whatsappEnabled && (
              <div className="mt-3">
                <label className="text-sm font-medium text-neutral-700">WhatsApp Number</label>
                {isEdit ? (
                  <div>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g., +923001234567"
                      className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md outline-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +92 for Pakistan)</p>
                  </div>
                ) : (
                  <p className="text-gray-600 mt-1">{whatsappNumber || 'Not set'}</p>
                )}
              </div>
            )}
            
            {whatsappEnabled && !isEdit && (
              <div className="mt-3 p-3 bg-white rounded-md">
                <p className="text-sm text-gray-600 mb-2">Send these commands to manage appointments:</p>
                <div className="space-y-1">
                  <p className="text-xs"><span className="font-mono bg-gray-100 px-1 rounded">STATUS</span> - Check appointment status</p>
                  <p className="text-xs"><span className="font-mono bg-gray-100 px-1 rounded">CANCEL</span> - Cancel appointment</p>
                  <p className="text-xs"><span className="font-mono bg-gray-100 px-1 rounded">HELP</span> - Get help</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          {isEdit ? (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:text-white hover:bg-primary transition-all duration-300 flex items-center justify-center"
              onClick={updateUserProfileData}
              disabled={loading}
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin text-xl" />
              ) : (
                "Save Information"
              )}
            </button>
          ) : (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:text-white hover:bg-primary transition-all duration-300"
              onClick={() => setIsEdit(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default MyProfile;