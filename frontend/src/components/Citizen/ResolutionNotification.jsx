import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Camera, 
  Upload, 
  Send,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useComplaintsContext } from '../../context/ComplaintsContext';

const ResolutionNotification = ({ complaint, onClose, onRaiseNewTicket }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'satisfied', 'dissatisfied', null
  const [newTicketData, setNewTicketData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    images: []
  });
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const { addComplaint } = useComplaintsContext();

  // Get resolution details
  const resolution = complaint.timeline?.find(update => 
    update.action === 'Status updated to resolved' || 
    update.action === 'Complaint resolved'
  );

  // Handle feedback submission
  const handleFeedback = (type) => {
    setFeedback(type);
    // In a real app, this would send feedback to the backend
    console.log(`Feedback submitted: ${type} for complaint ${complaint._id}`);
  };

  // Handle new ticket creation
  const handleNewTicket = async () => {
    try {
      const ticketData = {
        ...newTicketData,
        location: complaint.location,
        relatedComplaint: complaint._id,
        reason: 'Resolution incomplete or incorrect'
      };

      await addComplaint(ticketData);
      setShowNewTicketForm(false);
      onRaiseNewTicket && onRaiseNewTicket();
      
      // Show success message
      alert('New ticket created successfully! Officials will review your concerns.');
    } catch (error) {
      console.error('Error creating new ticket:', error);
      alert('Failed to create new ticket. Please try again.');
    }
  };

  // Handle file upload for new ticket
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewTicketData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  // Remove file
  const removeFile = (index) => {
    setNewTicketData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Issue Resolved!</h2>
                <p className="text-sm text-gray-600">Your complaint has been successfully resolved</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Complaint Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{complaint.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">{complaint.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <span className="ml-2 font-medium">{complaint.location?.address}</span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>
                <span className="ml-2 font-medium">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Resolved:</span>
                <span className="ml-2 font-medium">
                  {resolution ? new Date(resolution.timestamp).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Resolution Details */}
          {resolution && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">Resolution Details</h4>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  {showDetails ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Resolution Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {resolution.comment || 'Issue has been resolved by the maintenance team.'}
                      </p>
                    </div>
                    
                    {resolution.files && resolution.files.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Supporting Documents:</span>
                        <div className="mt-2 space-y-2">
                          {resolution.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Resolved on {new Date(resolution.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">How satisfied are you with this resolution?</h4>
            <div className="flex gap-4">
              <button
                onClick={() => handleFeedback('satisfied')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  feedback === 'satisfied'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Satisfied
              </button>
              <button
                onClick={() => handleFeedback('dissatisfied')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  feedback === 'dissatisfied'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                Not Satisfied
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            
            <div className="flex gap-3">
              {feedback === 'dissatisfied' && (
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Raise New Ticket
                </button>
              )}
              
              {feedback === 'satisfied' && (
                <div className="text-green-600 text-sm font-medium">
                  Thank you for your feedback!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Ticket Form Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Raise New Ticket</h2>
                <button
                  onClick={() => setShowNewTicketForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    value={newTicketData.title}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of the remaining issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={newTicketData.description}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Explain why the previous resolution was incomplete or incorrect..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Road Maintenance">Road Maintenance</option>
                    <option value="Street Lighting">Street Lighting</option>
                    <option value="Garbage Collection">Garbage Collection</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Sewage">Sewage</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Noise Pollution">Noise Pollution</option>
                    <option value="Air Quality">Air Quality</option>
                    <option value="Public Transport">Public Transport</option>
                    <option value="Parks & Recreation">Parks & Recreation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level
                  </label>
                  <select
                    value={newTicketData.severity}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Evidence (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="new-ticket-files"
                    />
                    <label htmlFor="new-ticket-files" className="cursor-pointer">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Upload photos or documents
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum 5 files, up to 10MB each
                      </p>
                    </label>
                  </div>

                  {/* File List */}
                  {newTicketData.images.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newTicketData.images.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This new ticket will be linked to your previous complaint 
                    and will be reviewed by officials with higher priority.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowNewTicketForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNewTicket}
                    disabled={!newTicketData.title || !newTicketData.description}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit New Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolutionNotification; 