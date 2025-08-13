import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const ManageDoctors = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, backendUrl } = useContext(AdminContext);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpeciality, setFilterSpeciality] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const specialities = [
    "General physician",
    "Gynecologist", 
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist"
  ];

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, filterSpeciality, filterAvailability]);

  const filterDoctors = () => {
    let filtered = doctors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Speciality filter
    if (filterSpeciality !== "all") {
      filtered = filtered.filter(doctor => doctor.speciality === filterSpeciality);
    }

    // Availability filter
    if (filterAvailability !== "all") {
      const isAvailable = filterAvailability === "available";
      filtered = filtered.filter(doctor => doctor.available === isAvailable);
    }

    setFilteredDoctors(filtered);
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor({
      ...doctor,
      address1: doctor.address?.line1 || "",
      address2: doctor.address?.line2 || ""
    });
    setShowEditModal(true);
  };

  const updateDoctor = async () => {
    try {
      const updateData = {
        name: editingDoctor.name,
        email: editingDoctor.email,
        experience: editingDoctor.experience,
        fee: editingDoctor.fee,
        about: editingDoctor.about,
        speciality: editingDoctor.speciality,
        degree: editingDoctor.degree,
        address: {
          line1: editingDoctor.address1,
          line2: editingDoctor.address2
        },
        available: editingDoctor.available
      };

      const { data } = await axios.put(
        `${backendUrl}/api/admin/update-doctor/${editingDoctor._id}`,
        updateData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Doctor updated successfully");
        setShowEditModal(false);
        setEditingDoctor(null);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update doctor");
    }
  };

  const deleteDoctor = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctorName}? This action cannot be undone.`)) {
      try {
        const { data } = await axios.delete(
          `${backendUrl}/api/admin/delete-doctor/${doctorId}`,
          { headers: { aToken } }
        );

        if (data.success) {
          toast.success("Doctor deleted successfully");
          getAllDoctors();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete doctor");
      }
    }
  };

  return (
    <div className="m-5 max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Manage Doctors</h1>
        <button 
          onClick={() => window.location.href = '/add-doctor'}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark"
        >
          <FaPlus /> Add New Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md outline-primary"
            />
          </div>
          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md outline-primary"
          >
            <option value="all">All Specialities</option>
            {specialities.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md outline-primary"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredDoctors.length} doctors
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Speciality</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Experience</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Fee</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor, index) => (
                <tr key={doctor._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{doctor.speciality}</td>
                  <td className="py-3 px-4 text-gray-700">{doctor.experience}</td>
                  <td className="py-3 px-4 text-gray-700">${doctor.fee}</td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={doctor.available}
                        onChange={() => changeAvailability(doctor._id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditDoctor(doctor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit Doctor"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteDoctor(doctor._id, doctor.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete Doctor"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-medium mb-4">Edit Doctor</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingDoctor.email}
                  onChange={(e) => setEditingDoctor({...editingDoctor, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                <select
                  value={editingDoctor.speciality}
                  onChange={(e) => setEditingDoctor({...editingDoctor, speciality: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                >
                  {specialities.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select
                  value={editingDoctor.experience}
                  onChange={(e) => setEditingDoctor({...editingDoctor, experience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(year => (
                    <option key={year} value={`${year} Year`}>{year} Year</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee ($)</label>
                <input
                  type="number"
                  value={editingDoctor.fee}
                  onChange={(e) => setEditingDoctor({...editingDoctor, fee: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  value={editingDoctor.degree}
                  onChange={(e) => setEditingDoctor({...editingDoctor, degree: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={editingDoctor.address1}
                  onChange={(e) => setEditingDoctor({...editingDoctor, address1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={editingDoctor.address2}
                  onChange={(e) => setEditingDoctor({...editingDoctor, address2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                <textarea
                  value={editingDoctor.about}
                  onChange={(e) => setEditingDoctor({...editingDoctor, about: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDoctor(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateDoctor}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Update Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;