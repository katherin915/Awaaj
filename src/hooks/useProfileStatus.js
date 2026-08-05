import { useState, useEffect } from 'react';

const useProfileStatus = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const checkProfileStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found in localStorage');
      setIsLoading(false);
      setProfileData(null);
      setIsProfileComplete(false);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Fetching profile data with token...');
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_BASE}/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfileData(data);
        setIsProfileComplete(Boolean(data.isProfileComplete));
      } else if (response.status === 401) {
        // Token invalid or expired
        console.log('Token invalid or expired - removing from storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsProfileComplete(false);
        setProfileData(null);
      } else {
        // Other error - try to get error message
        try {
          const errorData = await response.json();
          console.error('Failed to fetch profile:', errorData);
        } catch (e) {
          console.error('Failed to fetch profile, status code:', response.status);
        }
        setIsProfileComplete(false);
        setProfileData(null);
      }
    } catch (error) {
      console.error('Network error checking profile status:', error.message);
      console.error('Full error:', error);
      setIsProfileComplete(false);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkProfileStatus();
    
    // Listen for storage events to update if token changes
    const handleStorageChange = () => {
      checkProfileStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Custom event for login/logout within the same tab
    window.addEventListener('auth-change', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  return {
    isProfileComplete,
    isLoading,
    profileData,
    refetch: checkProfileStatus
  };
};

export default useProfileStatus;
