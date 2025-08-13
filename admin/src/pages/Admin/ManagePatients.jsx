import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const ManagePatients = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const { calculateAge } = useContext(AppContext);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterWhatsApp, setFilterWhatsApp] = useState("all");
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (aToken) {
      getAllPatients();
    }
  }, [aToken]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterGender, filterWhatsApp]);

  const getAllPatients = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/all-patients`, {
        headers: { aToken }
      });

      if (data.success) {
        setPatients(data.patients);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (filterGender !== "all") {
      filtered = filtered.filter(patient => patient.gender === filterGender);
    }

    // WhatsApp filter
    if (filterWhatsApp !== "all") {
      const hasWhatsApp = filterWhatsApp === "enabled";
      filtered = filtered.filter(patient => patient.whatsappEnabled === hasWhatsApp);
    }

    setFilteredPatients(filtered);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient({
      ...patient,
      address1: patient.address?.line1 || "",
      address2: patient.address?.line2 || ""
    });
    setShowEditModal(true);
  };

  const updatePatient = async () => {
    try {
      const updateData = {
        name: editingPatient.name,
        email: editingPatient.email,
        phone: editingPatient.phone,
        dob: editingPatient.dob,
        gender: editingPatient.gender,
        address: {
          line1: editingPatient.address1,
          line2: editingPatient.address2
        },
        whatsappEnabled: editingPatient.whatsappEnabled,
        whatsappNumber: editingPatient.whatsappNumber
      };

      const { data } = await axios.put(
        `${backendUrl}/api/admin/update-patient/${editingPatient._id}`,
        updateData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Patient updated successfully");
        setShowEditModal(false);
        setEditingPatient(null);
        getAllPatients();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update patient");
    }
  };

  const deletePatient = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to delete ${patientName}? This will also delete all their appointments. This action cannot be undone.`)) {
      try {
        const { data } = await axios.delete(
          `${backendUrl}/api/admin/delete-patient/${patientId}`,
          { headers: { aToken } }
        );

        if (data.success) {
          toast.success("Patient deleted successfully");
          getAllPatients();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete patient");
      }
    }
  };

  if (loading) {
    return (
      <div className="m-5 flex items-center justify-center h-64">
        <div className="text-lg">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="m-5 max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Manage Patients</h1>
        <button 
          onClick={() => window.location.href = '/add-patient'}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark"
        >
          <FaPlus /> Add New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md outline-primary"
            />
          </div>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md outline-primary"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={filterWhatsApp}
            onChange={(e) => setFilterWhatsApp(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md outline-primary"
          >
            <option value="all">All Notifications</option>
            <option value="enabled">WhatsApp Enabled</option>
            <option value="disabled">Email Only</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredPatients.length} patients
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Age</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Gender</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Notifications</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => (
                <tr key={patient._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.image}
                        alt={patient.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {calculateAge(patient.dob)} years
                  </td>
                  <td className="py-3 px-4 text-gray-700">{patient.gender}</td>
                  <td className="py-3 px-4 text-gray-700">{patient.phone}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {patient.whatsappEnabled ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <FaWhatsapp />
                          <span className="text-xs">WhatsApp</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-blue-600">
                          <FaEnvelope />
                          <span className="text-xs">Email</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit Patient"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deletePatient(patient._id, patient.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete Patient"
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
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No patients found matching your criteria.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-medium mb-4">Edit Patient</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingPatient.name}
                  onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingPatient.email}
                  onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editingPatient.dob}
                  onChange={(e) => setEditingPatient({...editingPatient, dob: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={editingPatient.gender}
                  onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={editingPatient.address1}
                  onChange={(e) => setEditingPatient({...editingPatient, address1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={editingPatient.address2}
                  onChange={(e) => setEditingPatient({...editingPatient, address2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                />
              </div>
              
              {/* WhatsApp Settings */}
              <div className="md:col-span-2 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FaWhatsapp className="text-green-500 text-xl" />
                    <div>
                      <p className="font-medium text-gray-700">WhatsApp Notifications</p>
                      <p className="text-sm text-gray-500">Enable WhatsApp notifications for this patient</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPatient.whatsappEnabled}
                      onChange={(e) => setEditingPatient({...editingPatient, whatsappEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                
                {editingPatient.whatsappEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={editingPatient.whatsappNumber || ''}
                      onChange={(e) => setEditingPatient({...editingPatient, whatsappNumber: e.target.value})}
                      placeholder="e.g., +923001234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +92 for Pakistan)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPatient(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updatePatient}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Update Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;