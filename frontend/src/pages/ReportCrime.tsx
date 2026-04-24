import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { crimeAPI } from '../services/api';
import { CrimeReportFormData, CrimeType, Severity } from '../types';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ReportCrime: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CrimeReportFormData>({
    title: '',
    description: '',
    crime_type: 'theft',
    severity: 'medium',
    location: {
      latitude: 0.3476, // Default Kampala coordinates
      longitude: 32.5825,
    },
    address: '',
    district: '',
    county: '',
    subcounty: '',
    parish: '',
    village: '',
    incident_date: new Date().toISOString().slice(0, 16),
    evidence: [],
    witnesses: [],
    notes: '',
    is_anonymous: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState('');
  const [currentWitness, setCurrentWitness] = useState({
    name: '',
    phone: '',
    statement: '',
    statementFile: null as File | null,
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const crimeTypes: CrimeType[] = [
    'theft', 'assault', 'burglary', 'vandalism', 'fraud', 
    'drug_offense', 'traffic_violation', 'domestic_violence', 
    'cyber_crime', 'murder', 'kidnapping', 'other'
  ];

  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parent]: { ...parentValue, [child]: value }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
          }));
          setUseCurrentLocation(true);
          toast.success('Location retrieved successfully');
        },
        (error) => {
          toast.error('Unable to retrieve location. Please enter manually.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const addEvidence = () => {
    if (currentEvidence.trim()) {
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence!, currentEvidence.trim()]
      }));
      setCurrentEvidence('');
    }
  };

  const removeEvidence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence!.filter((_, i) => i !== index)
    }));
  };

  const addWitness = () => {
    if (currentWitness.name || currentWitness.phone || currentWitness.statement || currentWitness.statementFile) {
      setFormData(prev => ({
        ...prev,
        witnesses: [...prev.witnesses!, { ...currentWitness }]
      }));
      setCurrentWitness({ name: '', phone: '', statement: '', statementFile: null });
    }
  };

  const removeWitness = (index: number) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses!.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the crime report');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description of the incident');
      return;
    }
    
    if (!formData.incident_date) {
      toast.error('Please specify the incident date and time');
      return;
    }

    setLoading(true);

    try {
      const response = await crimeAPI.createCrimeReport(formData);
      toast.success('Crime report submitted successfully!');
      
      // Emit real-time update
      if (socket) {
        socket.emit('new-crime', response.data.report);
      }
      
      navigate('/crimes');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit crime report';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'critical': return 'bg-red-600 text-white border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Report Crime Incident</h1>
              <p className="mt-1 text-sm text-gray-500">
                Provide detailed information about the crime incident
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div>
              <label htmlFor="title" className="label">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="input"
                placeholder="Brief title of the incident"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="label">Description *</label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="input"
                placeholder="Detailed description of what happened"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="crime_type" className="label">Crime Type *</label>
                <select
                  id="crime_type"
                  name="crime_type"
                  required
                  className="input"
                  value={formData.crime_type}
                  onChange={handleChange}
                >
                  {crimeTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="severity" className="label">Severity Level *</label>
                <select
                  id="severity"
                  name="severity"
                  required
                  className="input"
                  value={formData.severity}
                  onChange={handleChange}
                >
                  {severities.map(severity => (
                    <option key={severity} value={severity}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </option>
                  ))}
                </select>
                <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(formData.severity)}`}>
                  {formData.severity.toUpperCase()} SEVERITY
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="incident_date" className="label">Date & Time of Incident *</label>
              <input
                type="datetime-local"
                id="incident_date"
                name="incident_date"
                required
                className="input"
                value={formData.incident_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Location Information</h3>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="label">GPS Coordinates</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    className="input"
                    value={formData.location.latitude}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, latitude: parseFloat(e.target.value) || 0 }
                      }));
                    }}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    className="input"
                    value={formData.location.longitude}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, longitude: parseFloat(e.target.value) || 0 }
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-secondary"
                >
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Use Current Location
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="label">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                className="input"
                placeholder="Street address or landmark"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="district" className="label">District</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  className="input"
                  placeholder="e.g., Kampala"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="county" className="label">County</label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  className="input"
                  placeholder="County"
                  value={formData.county}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="subcounty" className="label">Sub-county</label>
                <input
                  type="text"
                  id="subcounty"
                  name="subcounty"
                  className="input"
                  placeholder="Sub-county"
                  value={formData.subcounty}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="parish" className="label">Parish</label>
                <input
                  type="text"
                  id="parish"
                  name="parish"
                  className="input"
                  placeholder="Parish"
                  value={formData.parish}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="village" className="label">Village/Zone</label>
                <input
                  type="text"
                  id="village"
                  name="village"
                  className="input"
                  placeholder="Village or zone"
                  value={formData.village}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Evidence</h3>
            
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add evidence (e.g., photos, documents, CCTV footage)"
                  className="input flex-1"
                  value={currentEvidence}
                  onChange={(e) => setCurrentEvidence(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addEvidence}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              
              {formData.evidence && formData.evidence.length > 0 && (
                <ul className="space-y-1">
                  {formData.evidence.map((evidence, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{evidence}</span>
                      <button
                        type="button"
                        onClick={() => removeEvidence(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Witnesses */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Witnesses</h3>
            
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Witness name"
                  className="input"
                  value={currentWitness.name}
                  onChange={(e) => setCurrentWitness(prev => ({ ...prev, name: e.target.value }))}
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="input"
                  value={currentWitness.phone}
                  onChange={(e) => setCurrentWitness(prev => ({ ...prev, phone: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={addWitness}
                  className="btn-secondary"
                >
                  Add Witness
                </button>
              </div>
              
              <textarea
                placeholder="Witness statement (optional)"
                className="input"
                rows={2}
                value={currentWitness.statement}
                onChange={(e) => setCurrentWitness(prev => ({ ...prev, statement: e.target.value }))}
              />
              
              {/* Witness Statement File Upload */}
              <div className="space-y-2">
                <label className="label">Upload Witness Statement (PDF, DOC, DOCX, TXT - Max 5MB)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size must be less than 5MB');
                          e.target.value = '';
                          return;
                        }
                        setCurrentWitness(prev => ({ ...prev, statementFile: file }));
                      }
                    }}
                    className="hidden"
                    id="witness-statement-file"
                  />
                  <label
                    htmlFor="witness-statement-file"
                    className="btn-outline cursor-pointer"
                  >
                    Choose File
                  </label>
                  {currentWitness.statementFile && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 truncate max-w-xs">
                        {currentWitness.statementFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentWitness(prev => ({ ...prev, statementFile: null }))}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                {currentWitness.statementFile && (
                  <div className="text-xs text-gray-500">
                    File: {currentWitness.statementFile.name} ({(currentWitness.statementFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              
              {formData.witnesses && formData.witnesses.length > 0 && (
                <ul className="space-y-2">
                  {formData.witnesses.map((witness, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{witness.name || 'Anonymous'}</p>
                          {witness.phone && <p className="text-sm text-gray-600">{witness.phone}</p>}
                          {witness.statement && <p className="text-sm text-gray-700 mt-1">{witness.statement}</p>}
                          {witness.statementFile && (
                            <div className="flex items-center space-x-2 mt-1">
                              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-600">{witness.statementFile.name}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWitness(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h3>
            
            <div>
              <label htmlFor="notes" className="label">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="input"
                placeholder="Any additional information that might be helpful"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_anonymous"
                name="is_anonymous"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.is_anonymous}
                onChange={handleChange}
              />
              <label htmlFor="is_anonymous" className="ml-2 text-sm text-gray-700">
                Report anonymously (your identity will not be disclosed)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/crimes')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCrime;
