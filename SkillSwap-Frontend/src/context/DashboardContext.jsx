import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { jwtDecode } from 'jwt-decode';
import UserProfileService from '../services/userProfile.service';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [decodedUser, setDecodedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch user data
    const fetchUserData = async (forceRefresh = false) => {
        if (!user?.token) return;
        
        setLoading(true);
        setError(null);
        try {
            const decoded = jwtDecode(user.token);
            const userData = await UserProfileService.getProfileByUserId(decoded.id); 
            setDecodedUser(userData.data);
        } catch (err) {
            setError("Failed to load user data");
            console.error("Invalid token or API error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [user]);

    const userData = useMemo(() => {
        return decodedUser || user || {};
    }, [decodedUser, user]);

    // Method to update user data directly (for immediate updates after profile changes)
    const updateUser = (updatedUserData) => {
        setDecodedUser(prevUser => ({
            ...prevUser,
            ...updatedUserData
        }));
    };

    // Method to refresh user data from server
    const refreshUser = async () => {
        await fetchUserData(true);
    };

    const value = {
        user: userData,
        loading: authLoading || loading,
        error,
        updateUser,        // Add this method
        refreshUser,       // Add this method
        refreshUserData: refreshUser // Keep for backward compatibility
    };

    return (
         <DashboardContext.Provider value={value}>
            {children}
         </DashboardContext.Provider>
    )
}
