import React, { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaPlus, FaTrash, FaEye, FaClock } from "react-icons/fa";
import axios from "axios";

const DoctorLeaveRequest = () => {
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    type: "vacation" // vacation, sick, emergency, other
  });

  const leaveTypes = [
    { value: "vacation", label: "Vacation" },
    { value: "sick", label: "Sick Leave" },
    { value: "emergency", label: "Emergency" },
    { value: "personal", label: "Personal" },
    { value: "other", label: "Other" }
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fetch leave requests
  const getLeaveRequests = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/leave-requests", {
        headers: { dToken }
      });
      if (data.success) {
        setLeaveRequests(data.leaveRequests);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch leave requests");
    }
  };

  // Submit leave request
  const submitLeaveRequest = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fromDate || !formData.toDate || !formData.reason.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) {
      toast.error("From date cannot be in the past");
      return;
    }

    if (toDate < fromDate) {
      toast.error("To date must be after from date");
      return;
    }

    // Check for overlapping requests
    const hasOverlap = leaveRequests.some(request => {
      if (request.status === 'rejected') return false;
      
      const existingFrom = new Date(request.fromDate);
      const existingTo = new Date(request.toDate);
      
      return (fromDate <= existingTo && toDate >= existingFrom);
    });

    if (hasOverlap) {
      toast.error("Leave request overlaps with existing request");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/request-leave",
        formData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success("Leave request submitted successfully");
        setFormData({
          fromDate: "",
          toDate: "",
          reason: "",
          type: "vacation"
        });
        setShowForm(false);
        getLeaveRequests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  // Cancel leave request (only pending ones)
  const cancelLeaveRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) {
      return;
    }

    try {
      const { data } = await axios.delete(
        backendUrl + `/api/doctor/cancel-leave-request/${requestId}`,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success("Leave request cancelled");
        getLeaveRequests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel leave request");
    }
  };

  // Calculate number of days
  const calculateDays = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (dToken) {
      getLeaveRequests();
    }
  }, [dToken]);

  return (
    <div className="m-5 max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Leave Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
        >
          <FaPlus />
          Request Leave
        </button>
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">New Leave Request</h2>
          <form onSubmit={submitLeaveRequest}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date *
                </label>
                <input
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                  min={getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date *
                </label>
                <input
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                  min={formData.fromDate || getTodayDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                  required
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                  {formData.fromDate && formData.toDate ? 
                    `${calculateDays(formData.fromDate, formData.toDate)} day(s)` : 
                    'Select dates'
                  }
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Please provide reason for leave request..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Your Leave Requests</h2>
        </div>
        
        {leaveRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaCalendarAlt className="mx-auto text-4xl mb-4 text-gray-300" />
            <p>No leave requests found</p>
            <p className="text-sm mt-2">Click "Request Leave" to submit your first leave request</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Dates</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Duration</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Reason</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request, index) => (
                  <tr key={request._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatDate(request.fromDate)}</span>
                        <span className="text-sm text-gray-500">to {formatDate(request.toDate)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center gap-1">
                        <FaClock className="text-gray-400" />
                        {calculateDays(request.fromDate, request.toDate)} day(s)
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="capitalize">{request.type}</span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-500">
                        {formatDate(request.submittedAt)}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => cancelLeaveRequest(request._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Cancel Request"
                          >
                            <FaTrash />
                          </button>
                        )}
                        {request.adminResponse && (
                          <button
                            onClick={() => toast.info(`Admin Response: ${request.adminResponse}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Admin Response"
                          >
                            <FaEye />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Total Requests</div>
          <div className="text-2xl font-semibold text-gray-900">{leaveRequests.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {leaveRequests.filter(r => r.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-2xl font-semibold text-green-600">
            {leaveRequests.filter(r => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Rejected</div>
          <div className="text-2xl font-semibold text-red-600">
            {leaveRequests.filter(r => r.status === 'rejected').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLeaveRequest;