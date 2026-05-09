import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginAPI, logout as logoutAPI, fetchUserInfo } from "../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => { 
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Clear error when user changes
    useEffect(() => {
        if (user) setError(null);
    }, [user]);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetchUserInfo();
                    const userData = { ...res, token };
                    console.log('Init - User data from fetchUserInfo:', res);
                    console.log('Init - Final user data:', userData);
                    setUser(userData);
                } catch (err) {
                    console.error("Error fetching user info:", err.response?.data?.msg || err.message);
                    localStorage.removeItem("token");
                    setUser(null);
                    // Don't set error here as it's initialization
                }
            }
            setLoading(false); // Fixed: was setLoading(null)
        };
        initializeAuth();
    }, []);

    const login = async (formData) => {
        try {
            setLoading(true);
            setError(null);
            
            const res = await loginAPI(formData);
            const token = res.data.token; 
            localStorage.setItem("token", token);

            const userInfo = await fetchUserInfo(); 
            const userData = { ...userInfo, token };
            console.log('Login - User data from fetchUserInfo:', userInfo);
            console.log('Login - Final user data:', userData);
            setUser(userData);
            
            return userData;
        } catch (err) {
            const errorMsg = err.response?.data?.msg || "Login failed";
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await logoutAPI();
        } catch (err) {
            console.error("Logout error:", err);
            // Continue with logout even if API call fails
        } finally {
            localStorage.removeItem("token");
            setUser(null);
            setError(null);
            setLoading(false);
        }
    };

    // Add method to clear errors
    const clearError = () => setError(null);

    const value = {
        user,
        token: user?.token || localStorage.getItem("token"),
        login,
        logout,
        loading,
        error,
        clearError,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
