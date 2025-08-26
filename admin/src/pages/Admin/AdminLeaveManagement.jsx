import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { FaCheck, FaTimes, FaEye, FaClock, FaFilter, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const AdminLeaveManagement = () => {
  const { 
    aToken, 
    leaveRequests, 
    getAllLeaveRequests, 
    approveLeaveRequest, 
    rejectLeaveRequest,
    leaveStats,
    getLeaveStats 
  } = useContext(AdminContext);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(""); // 'approve' or 'reject'
  const [adminResponse, setAdminResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800", 
    rejected: "bg-red-100 text-red-800"
  };

  // Load data on component mount
  useEffect(() => {
    if (aToken) {
      getAllLeaveRequests();
      getLeaveStats();
    }
  }, [aToken]);

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    if (filterStatus !== "all" && request.status !== filterStatus) {
      return false;
    }
    if (filterDoctor !== "all" && request.doctorId !== filterDoctor) {
      return false;
    }
    return true;
  });

  // Get unique doctors for filter
  const uniqueDoctors = [...new Map(leaveRequests.map(req => [req.doctorId, req.doctorData])).values()];

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

  // Handle approve/reject modal
  const openModal = (request, type) => {
    setSelectedRequest(request);
    setModalType(type);
    setAdminResponse("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setModalType("");
    setAdminResponse("");
  };

  // Handle approval
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await approveLeaveRequest(selectedRequest._id, adminResponse);
      closeModal();
    } catch (error) {
      console.error('Error approving leave:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle rejection
  const handleReject = async () => {
    if (!selectedRequest || !adminResponse.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    try {
      await rejectLeaveRequest(selectedRequest._id, adminResponse);
      closeModal();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-5 max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-medium">Leave Management</h1>
        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
          Manage doctor leave requests
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Total Requests</div>
          <div className="text-2xl font-semibold text-gray-900">{leaveStats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-semibold text-yellow-600">{leaveStats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-2xl font-semibold text-green-600">{leaveStats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Rejected</div>
          <div className="text-2xl font-semibold text-red-600">{leaveStats.rejected}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">This Month</div>
          <div className="text-2xl font-semibold text-blue-600">{leaveStats.thisMonth}</div>
        </div>
      </div>

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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <select 
              value={filterDoctor} 
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="border rounded px-3 py-1 text-sm outline-primary"
            >
              <option value="all">All Doctors</option>
              {uniqueDoctors.map(doctor => (
                <option key={doctor?.name || 'unknown'} value={doctor?.name || 'unknown'}>
                  Dr. {doctor?.name || 'Unknown'}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-sm">
            Total: {filteredRequests.length} requests
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white border rounded text-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaCalendarAlt className="mx-auto text-4xl mb-4 text-gray-300" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Leave Dates</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <tr key={request._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={request.doctorData?.image}
                          alt={request.doctorData?.name}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            Dr. {request.doctorData?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.doctorData?.speciality}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatDate(request.fromDate)}</span>
                        <span className="text-xs text-gray-500">to {formatDate(request.toDate)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1">
                        <FaClock className="text-gray-400" />
                        {calculateDays(request.fromDate, request.toDate)} day(s)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize">{request.type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">
                        {formatDate(request.submittedAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => openModal(request, 'approve')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Approve Leave"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => openModal(request, 'reject')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Reject Leave"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => toast.info(request.adminResponse || 'No admin response provided')}
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

      {/* Modal for Approve/Reject */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">
              {modalType === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Dr. {selectedRequest.doctorData?.name}</p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedRequest.fromDate)} - {formatDate(selectedRequest.toDate)}
              </p>
              <p className="text-sm text-gray-600">
                Reason: {selectedRequest.reason}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalType === 'approve' ? 'Admin Note (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder={
                  modalType === 'approve' 
                    ? "Add any notes for the doctor..."
                    : "Please provide reason for rejection..."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-primary"
                rows={3}
                required={modalType === 'reject'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={modalType === 'approve' ? handleApprove : handleReject}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-70 ${
                  modalType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={loading || (modalType === 'reject' && !adminResponse.trim())}
              >
                {loading ? 'Processing...' : (modalType === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;