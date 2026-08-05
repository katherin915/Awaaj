import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  AlertTriangle,
  Clock,
  Edit3,
  Save,
  X,
  CheckCircle,
  Camera,
  Phone,
  Calendar,
  Activity,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useProfileStatus from '../hooks/useProfileStatus';
import API_BASE from '../utils/api';
import csrfManager from '../utils/csrfManager';
import Navbar from '../components/Navbar';


const Profile = () => {
  const navigate = useNavigate();
  const { profileData, isLoading, refetch } = useProfileStatus();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    location: '',
    phone: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profileData) {
      console.log('Profile data loaded:', profileData);
      const data = {
        username: profileData.name || '',
        email: profileData.email || '',
        location: profileData.location || '',
        phone: profileData.phone || ''
      };
      setFormData(data);
      setOriginalData(data);
    } else {
      console.log('No profile data available, isLoading:', isLoading);
      const token = localStorage.getItem('token');
      console.log('Token exists in localStorage:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
      }
    }
  }, [profileData, isLoading]);

  const validate = () => {
    const tempErrors = {};
    
    if (!formData.username.trim()) {
      tempErrors.username = 'Name is required';
    } else if (formData.username.trim().length < 2) {
      tempErrors.username = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      tempErrors.email = 'Invalid email format';
    }
    
    if (!formData.location.trim()) {
      tempErrors.location = 'Location is required';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = async () => {
    // Clear any previous errors
    setShowError(false);
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Session expired. Please login again.');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        navigate('/login');
      }, 2000);
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('Sending update request with token:', token ? 'Token exists' : 'No token');
      const response = await csrfManager.secureFetch(`${API_BASE}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
          location: formData.location,
          phone: formData.phone
        })
      });

      const data = await response.json();
      console.log('Update response:', response.status, data);

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.error || data.message || 'Failed to update profile');
      }

      setOriginalData(formData);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      
      // Refetch profile data
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
      
      // If it's an auth error, redirect to login
      if (error.message.includes('Session expired') || error.message.includes('login')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      <Navbar />
      
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-l-4 border-emerald-500 p-4 flex items-center gap-3 min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">Success!</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Profile updated successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-l-4 border-red-500 p-4 flex items-center gap-3 min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">Error</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your profile...</p>
          </div>
        ) : !profileData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-gray-900 dark:text-white font-bold text-xl mb-2">Unable to load profile</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {localStorage.getItem('token') 
                ? 'There was an error loading your profile data. Please check if the backend server is running on port 5000.'
                : 'Please try logging in again'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all duration-300"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all duration-300"
              >
                Go to Login
              </button>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Open browser console (F12) for more details</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sticky top-24">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group mb-4">
                    {profileData?.profilePictureUrl ? (
                      <img
                        src={profileData.profilePictureUrl}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border-4 border-emerald-500 shadow-lg">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-1">
                    {formData.username || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{formData.email}</p>
                  
                  <div className="mt-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Active Member</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issues Reported</span>
                    </div>
                    <span className="font-black text-emerald-600">0</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resolved</span>
                    </div>
                    <span className="font-black text-emerald-600">0</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 ${
                        isEditing
                          ? 'border-emerald-300 focus:border-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      } ${errors.username ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 ${
                        isEditing
                          ? 'border-emerald-300 focus:border-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      } ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 ${
                        isEditing
                          ? 'border-emerald-300 focus:border-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      } ${errors.location ? 'border-red-500' : ''}`}
                      placeholder="Enter your location"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  {/* Phone (Optional) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      Phone Number <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-300 ${
                        isEditing
                          ? 'border-emerald-300 focus:border-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Account Activity
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Account Status:</span>
                      <span className="font-bold text-emerald-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Profile Completion:</span>
                      <span className="font-bold text-gray-900 dark:text-white">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                      <span className="font-bold text-gray-900 dark:text-white">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
