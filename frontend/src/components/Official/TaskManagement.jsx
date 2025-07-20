import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Plus, 
  Edit, 
  Eye,
  Send,
  FileText,
  Camera,
  MapPin,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useComplaintsContext } from '../../context/ComplaintsContext';

const TaskManagement = () => {
  const { complaints, updateComplaintProgress } = useComplaintsContext();
  const [activeTasks, setActiveTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    progress: 0,
    notes: '',
    files: []
  });

  // Filter active tasks (in_progress complaints)
  useEffect(() => {
    const tasks = complaints
      .filter(complaint => complaint.status === 'in_progress')
      .map(complaint => ({
        ...complaint,
        progress: complaint.progress || 0,
        updates: complaint.updates || [],
        assignedTo: complaint.assignedTo || 'Squad Alpha'
      }));
    setActiveTasks(tasks);
  }, [complaints]);

  // Calculate progress percentage
  const getProgressPercentage = (task) => {
    return task.progress || 0;
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    if (percentage < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle progress update
  const handleProgressUpdate = async () => {
    if (!selectedTask) return;

    try {
      const newProgress = updateData.progress;
      const isCompleted = newProgress >= 100;

      // Update the task locally first
      setActiveTasks(prev => 
        prev.map(task => 
          task._id === selectedTask._id 
            ? {
                ...task,
                progress: newProgress,
                status: isCompleted ? 'resolved' : 'in_progress',
                updates: [
                  ...task.updates,
                  {
                    timestamp: new Date().toISOString(),
                    progress: newProgress,
                    notes: updateData.notes,
                    files: updateData.files.map(f => f.name)
                  }
                ]
              }
            : task
        )
      );

      // Update complaint progress in context
      await updateComplaintProgress(
        selectedTask._id, 
        newProgress,
        updateData.notes,
        updateData.files
      );

      // If completed, trigger notification
      if (isCompleted) {
        triggerCompletionNotification(selectedTask);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setShowUpdateModal(false);
      setSelectedTask(null);
      setUpdateData({ progress: 0, notes: '', files: [] });
    }
  };

  // Trigger completion notification
  const triggerCompletionNotification = (task) => {
    // In a real app, this would send a notification to the citizen
    console.log(`Notification sent to ${task.citizenId?.name} about resolution of: ${task.title}`);
    
    // Show success message
    alert(`Task completed! Notification sent to ${task.citizenId?.name || 'citizen'}`);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUpdateData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  // Remove file
  const removeFile = (index) => {
    setUpdateData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Open update modal
  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setUpdateData({
      progress: task.progress || 0,
      notes: '',
      files: []
    });
    setShowUpdateModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
        <p className="text-gray-600">Track and update progress on active complaints</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeTasks.filter(t => t.progress < 100).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeTasks.filter(t => t.progress >= 100).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teams Working</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(activeTasks.map(t => t.assignedTo)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTasks.map(task => (
          <div key={task._id} className="bg-white rounded-lg shadow p-6">
            {/* Task Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(task.status)}
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {task.location?.zone || 'Unknown Zone'}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {typeof task.assignedTo === 'object' ? task.assignedTo?.name : task.assignedTo || 'Unassigned'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openUpdateModal(task)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Update Progress"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedTask(task)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-gray-900">
                  {getProgressPercentage(task)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(getProgressPercentage(task))}`}
                  style={{ width: `${getProgressPercentage(task)}%` }}
                ></div>
              </div>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">{task.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Severity:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  task.severity === 'low' ? 'bg-green-100 text-green-800' :
                  task.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  task.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {task.severity.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Recent Updates */}
            {task.updates && task.updates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Updates</h4>
                <div className="space-y-2">
                  {task.updates.slice(-2).map((update, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>{new Date(update.timestamp).toLocaleString()}</span>
                        <span className="font-medium">{update.progress}%</span>
                      </div>
                      {update.notes && (
                        <p className="mt-1 text-gray-500">{update.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {activeTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tasks</h3>
          <p className="text-gray-600">All complaints are either pending or resolved.</p>
        </div>
      )}

      {/* Progress Update Modal */}
      {showUpdateModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Update Progress</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Task Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{selectedTask.title}</h3>
                  <p className="text-sm text-gray-600">{selectedTask.description}</p>
                </div>

                {/* Progress Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress: {updateData.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={updateData.progress}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Notes
                  </label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe the work completed..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="task-files"
                    />
                    <label htmlFor="task-files" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload files or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images, PDFs, documents up to 10MB each
                      </p>
                    </label>
                  </div>

                  {/* File List */}
                  {updateData.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {updateData.files.map((file, index) => (
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

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProgressUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && !showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Task Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTask.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedTask.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{selectedTask.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Severity:</span>
                      <span className="ml-2 font-medium">{selectedTask.severity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Assigned To:</span>
                      <span className="ml-2 font-medium">{typeof selectedTask.assignedTo === 'object' ? selectedTask.assignedTo?.name : selectedTask.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-2 font-medium">{selectedTask.location?.address}</span>
                    </div>
                  </div>
                </div>

                {/* Progress History */}
                {selectedTask.updates && selectedTask.updates.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Progress History</h4>
                    <div className="space-y-4">
                      {selectedTask.updates.map((update, index) => (
                        <div key={index} className="border-l-4 border-indigo-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(update.timestamp).toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-indigo-600">
                              {update.progress}%
                            </span>
                          </div>
                          {update.notes && (
                            <p className="text-sm text-gray-600 mb-2">{update.notes}</p>
                          )}
                          {update.files && update.files.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FileText className="h-3 w-3" />
                              <span>{update.files.length} file(s) uploaded</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      openUpdateModal(selectedTask);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Update Progress
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

export default TaskManagement; 