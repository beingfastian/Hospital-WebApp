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
  const [modalType, setModalType] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200", 
    rejected: "bg-red-100 text-red-800 border-red-200"
  };

  useEffect(() => {
    if (aToken) {
      getAllLeaveRequests();
      getLeaveStats();
    }
  }, [aToken]);

  const filteredRequests = leaveRequests.filter(request => {
    if (filterStatus !== "all" && request.status !== filterStatus) {
      return false;
    }
    if (filterDoctor !== "all" && request.doctorId !== filterDoctor) {
      return false;
    }
    return true;
  });

  const uniqueDoctors = [...new Map(leaveRequests.map(req => [req.doctorId, req.doctorData])).values()];

  const calculateDays = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

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

  const getTypeColor = (type) => {
    const colors = {
      vacation: "bg-blue-100 text-blue-700",
      sick: "bg-red-100 text-red-700",
      emergency: "bg-orange-100 text-orange-700",
      personal: "bg-purple-100 text-purple-700",
      other: "bg-gray-100 text-gray-700"
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Leave Management</h1>
        <p className="text-gray-600">Manage and review doctor leave requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{leaveStats?.total || 0}</div>
          <div className="text-sm text-gray-500">Total Requests</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{leaveStats?.pending || 0}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{leaveStats?.approved || 0}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-2xl font-bold text-red-600">{leaveStats?.rejected || 0}</div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{leaveStats?.thisMonth || 0}</div>
          <div className="text-sm text-gray-500">This Month</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={filterDoctor} 
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Doctors</option>
            {uniqueDoctors.map(doctor => (
              <option key={doctor?.name || 'unknown'} value={doctor?.name || 'unknown'}>
                Dr. {doctor?.name || 'Unknown'}
              </option>
            ))}
          </select>
          <div className="ml-auto text-sm text-gray-600">
            Showing: {filteredRequests.length} requests
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-gray-500">Leave requests will appear here when doctors submit them</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {/* Desktop View */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Doctor</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Leave Dates</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Duration</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Type</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
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
                            <p className="text-sm text-gray-500">
                              {request.doctorData?.speciality}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(request.fromDate)}</p>
                          <p className="text-sm text-gray-500">to {formatDate(request.toDate)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <FaClock className="text-xs" />
                          {calculateDays(request.fromDate, request.toDate)} days
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => openModal(request, 'approve')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve Leave"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => openModal(request, 'reject')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject Leave"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => toast.info(request.adminResponse || 'No admin response provided')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

            {/* Mobile View */}
            <div className="lg:hidden">
              {filteredRequests.map((request) => (
                <div key={request._id} className="p-4 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-12 h-12 rounded-full object-cover"
                        src={request.doctorData?.image}
                        alt={request.doctorData?.name}
                      />
                      <div>
                        <p className="font-medium text-gray-900">Dr. {request.doctorData?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{request.doctorData?.speciality}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Leave Period</p>
                      <p className="font-medium">{formatDate(request.fromDate)} - {formatDate(request.toDate)}</p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <FaClock className="text-xs" />
                        {calculateDays(request.fromDate, request.toDate)} days
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type & Reason</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)} mb-1`}>
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                      </span>
                      <p className="text-sm text-gray-700">{request.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Submitted: {formatDate(request.submittedAt)}
                    </span>
                    <div className="flex gap-2">
                      {request.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => openModal(request, 'approve')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => openModal(request, 'reject')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => toast.info(request.adminResponse || 'No admin response provided')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEye />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Approve/Reject */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {modalType === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">Dr. {selectedRequest.doctorData?.name}</p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedRequest.fromDate)} - {formatDate(selectedRequest.toDate)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Reason:</strong> {selectedRequest.reason}
              </p>
            </div>

            <div className="mb-6">
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={3}
                required={modalType === 'reject'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={modalType === 'approve' ? handleApprove : handleReject}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
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