import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Camera, 
  FileText, 
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import formatDate from '../../utils/formatDate';

const ComplaintDetailModal = ({ complaint, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === complaint.status) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusUpdate(complaint._id, newStatus, resolutionNotes, uploadedFiles);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {getStatusIcon(complaint.status)}
            <h2 className="text-xl font-semibold text-gray-900 ml-3">
              Complaint Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Complaint Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="text-sm text-gray-900 mt-1">{complaint.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900 mt-1">{complaint.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <p className="text-sm text-gray-900 mt-1 capitalize">{complaint.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Severity</label>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getSeverityColor(complaint.severity)}`}>
                        {complaint.severity}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <div className="flex items-center text-sm text-gray-900 mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {complaint.location?.address || 'No location specified'}
                    </div>
                    {complaint.location?.zone && (
                      <p className="text-xs text-gray-500 mt-1">Zone: {complaint.location.zone}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <div className="flex items-center text-sm text-gray-900 mt-1">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(complaint.createdAt)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Days Open</label>
                      <p className="text-sm text-gray-900 mt-1">{getDaysOpen(complaint.createdAt)} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Citizen Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{complaint.citizenId?.name || 'Anonymous'}</span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact</label>
                    <p className="text-sm text-gray-900 mt-1">{complaint.citizenId?.email || 'No email provided'}</p>
                  </div>
                </div>
              </div>

              {/* Citizen's Submitted Media */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Citizen's Submitted Media</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {complaint.attachments.map((file, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 truncate">
                            {file.originalName || file.filename}
                          </span>
                        </div>
                        <button className="text-xs text-indigo-600 hover:text-indigo-800 mt-1">
                          <Download className="h-3 w-3 inline mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Status Update */}
            <div className="space-y-6">
              {/* Current Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
                <div className="flex items-center">
                  {getStatusIcon(complaint.status)}
                  <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Status Update Form */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="pending">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Notes
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={4}
                      placeholder="Add notes about the resolution or current progress..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Proof/Photos
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 mr-2" />
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Selected files:</p>
                        <div className="space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="text-xs text-gray-500">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdating || newStatus === complaint.status}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdating ? 'Updating...' : 'Update Status'}
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {complaint.timeline && complaint.timeline.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                  <div className="space-y-3">
                    {complaint.timeline.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{entry.action}</p>
                          <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                          {entry.comment && (
                            <p className="text-sm text-gray-600 mt-1">{entry.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal; 