// ComplaintForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Navigation,
  Crosshair,
  Users
} from 'lucide-react';
import { useComplaintsContext } from '../../context/ComplaintsContext';

const ComplaintForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    location: {
      address: '',
      zone: '',
      coordinates: null
    },
    images: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, capturing, success, error
  const [submitError, setSubmitError] = useState('');
  const [assignedSquad, setAssignedSquad] = useState(null);

  const { addComplaint } = useComplaintsContext();

  // Zones for location selection
  const zones = [
    { id: 'downtown', name: 'Downtown', description: 'Financial district and city center' },
    { id: 'residential', name: 'Residential', description: 'Suburban areas and parks' },
    { id: 'commercial', name: 'Commercial', description: 'Shopping centers and business areas' },
    { id: 'industrial', name: 'Industrial', description: 'Factories and warehouses' },
    { id: 'suburban', name: 'Suburban', description: 'Outer residential areas' }
  ];

  // Categories for complaints - updated to match backend schema
  const categories = [
    'sanitation',
    'roads', 
    'water',
    'electricity',
    'parks',
    'traffic',
    'other'
  ];

  // Category display names
  const categoryDisplayNames = {
    'sanitation': 'Sanitation & Garbage',
    'roads': 'Roads & Infrastructure',
    'water': 'Water Supply',
    'electricity': 'Electricity & Lighting',
    'parks': 'Parks & Recreation',
    'traffic': 'Traffic & Transportation',
    'other': 'Other'
  };

  // Capture live location coordinates
  const captureLocation = async () => {
    setIsCapturingLocation(true);
    setLocationStatus('capturing');

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Get current position with high accuracy
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);
      
      // Determine zone based on coordinates
      const zone = determineZone(latitude, longitude);

      setFormData(prev => ({
        ...prev,
        location: {
          address: address,
          zone: zone,
          coordinates: { lat: latitude, lng: longitude }
        }
      }));

      // Determine squad assignment based on location
      await determineSquadAssignment(latitude, longitude);

      setLocationStatus('success');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setLocationStatus('idle'), 3000);

    } catch (error) {
      console.error('Error capturing location:', error);
      setLocationStatus('error');
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => setLocationStatus('idle'), 5000);
    } finally {
      setIsCapturingLocation(false);
    }
  };

  // Reverse geocoding using backend proxy endpoint
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reverse-geocode?lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        // Extract street address from the full display name
        const addressParts = data.display_name.split(', ');
        return addressParts.slice(0, 3).join(', '); // Take first 3 parts for cleaner address
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Determine zone based on coordinates (simplified for NYC area)
  const determineZone = (lat, lng) => {
    // Simplified zone determination based on NYC coordinates
    // In a real application, you'd have more precise zone boundaries
    
    if (lat >= 40.7050 && lat <= 40.7200 && lng >= -74.0150 && lng <= -74.0000) {
      return 'downtown';
    } else if (lat >= 40.7500 && lat <= 40.7700 && lng >= -73.9950 && lng <= -73.9750) {
      return 'residential';
    } else if (lat >= 40.7400 && lat <= 40.7600 && lng >= -74.0030 && lng <= -73.9830) {
      return 'commercial';
    } else if (lat >= 40.7320 && lat <= 40.7520 && lng >= -74.0010 && lng <= -73.9810) {
      return 'industrial';
    } else {
      return 'suburban';
    }
  };

  // Determine squad assignment based on location
  const determineSquadAssignment = async (lat, lng) => {
    try {
      // Check if coordinates fall within any squad's assigned regions
      if (lat >= 12.9000 && lat <= 13.2000 && lng >= 80.1000 && lng <= 80.4000) {
        setAssignedSquad({
          name: 'Squad Alpha',
          code: 'alpha',
          description: 'Handles complaints from Chennai region'
        });
      } else if (lat >= 18.9000 && lat <= 19.2000 && lng >= 72.7000 && lng <= 73.0000) {
        setAssignedSquad({
          name: 'Squad Beta',
          code: 'beta',
          description: 'Handles complaints from Mumbai region'
        });
      } else if (lat >= 12.8000 && lat <= 13.1000 && lng >= 77.4000 && lng <= 77.7000) {
        setAssignedSquad({
          name: 'Squad Gamma',
          code: 'gamma',
          description: 'Handles complaints from Bangalore region'
        });
      } else {
        setAssignedSquad(null);
      }
    } catch (error) {
      console.error('Error determining squad assignment:', error);
      setAssignedSquad(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('');
    }
    
    // Clear squad assignment when location changes
    if (assignedSquad && name.includes('location')) {
      setAssignedSquad(null);
    }
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };

  // Remove image
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.location.address.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.location.coordinates) {
      newErrors.location = 'Please capture your location coordinates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to submit a complaint');
      }

      // Prepare the complaint data in the format expected by the backend
      const complaintData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        severity: formData.severity,
        location: formData.location,
        images: formData.images
      };

      console.log('Submitting complaint:', complaintData);

      const result = await addComplaint(complaintData);
      
      console.log('Complaint submitted successfully:', result);
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmitError(error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get location status display
  const getLocationStatusDisplay = () => {
    switch (locationStatus) {
      case 'capturing':
        return (
          <div className="flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Capturing location...
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            Location captured successfully!
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            Failed to capture location. Please try again.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Submit New Complaint</h2>
            <button
              onClick={() => { if (onClose && typeof onClose === 'function') onClose(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Crosshair className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of the issue"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Provide detailed information about the issue..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {categoryDisplayNames[category]}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              
              {/* Location Capture Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={isCapturingLocation}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {isCapturingLocation ? 'Capturing...' : 'Capture My Location'}
                </button>
                
                {/* Location Status */}
                {getLocationStatusDisplay()}
              </div>

              {/* Captured Location Display */}
              {formData.location.coordinates && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-green-800 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">Location Captured</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div><strong>Address:</strong> {formData.location.address}</div>
                    <div><strong>Zone:</strong> {zones.find(z => z.id === formData.location.zone)?.name}</div>
                    <div><strong>Coordinates:</strong> {formData.location.coordinates.lat.toFixed(6)}, {formData.location.coordinates.lng.toFixed(6)}</div>
                  </div>
                </div>
              )}

              {/* Squad Assignment Display */}
              {assignedSquad && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-blue-800 mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">Squad Assignment</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div><strong>Squad:</strong> {assignedSquad.name}</div>
                    <div><strong>Code:</strong> {assignedSquad.code}</div>
                    <div><strong>Description:</strong> {assignedSquad.description}</div>
                  </div>
                </div>
              )}

              {/* Manual Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional - for verification)
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Street address (optional)"
                />
              </div>

              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Zone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone (Auto-detected from coordinates)
              </label>
              <select
                name="location.zone"
                value={formData.location.zone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} - {zone.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload images or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 5 images, JPG, PNG, GIF up to 5MB each
                  </p>
                </label>
              </div>

              {/* Preview uploaded images */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => { if (onClose && typeof onClose === 'function') onClose(); }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm; 