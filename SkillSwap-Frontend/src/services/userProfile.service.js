import API from "../APIs/api";

const UserProfileService = {
    // Basic Profile Oprations
    createProfile: async (profileData) => {
        try {
            const response = await API.post("/profile/create", profileData)
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProfileByUserId: async (userId) => {
        try {
            const response = await API.get(`/profile/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProfileById: async (profileId) => {
        try {
            const response = await API.get(`/profile/profile/${profileId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    updateProfile: async (userId, updateData) => {
        try {
            const response = await API.put(`/profile/user/${userId}`, updateData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteProfile: async (userId) => {
        try {
            const response = await API.delete(`/profile/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Public Profiles
    getPublicProfiles: async (page = 1, limit = 10, search = '', excludeUserId = null) => {
        try {
            const params = { page, limit, search };
            if (excludeUserId) params.excludeUserId = excludeUserId;

            const response = await API.get("/profile/public", {
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Experience Operations
    addExperience: async (userId, experienceData) => {
        try {
            const response = await API.post(`/profile/user/${userId}/experience`, experienceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateExperience: async (userId, experienceId, updateData) => {
        try {
            const response = await API.put(
                `/profile/user/${userId}/experience/${experienceId}`,
                updateData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    removeExperience: async (userId, experienceId) => {
        try {
            const response = await API.delete(`/profile/user/${userId}/experience/${experienceId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Education Operations
    addEducation: async (userId, educationData) => {
        try {
            const response = await API.post(`/profile/user/${userId}/education`, educationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateEducation: async (userId, educationId, updateData) => {
        try {
            const response = await API.put(
                `/profile/user/${userId}/education/${educationId}`,
                updateData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    removeEducation: async (userId, educationId) => {
        try {
            const response = await API.delete(`/profile/user/${userId}/education/${educationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Time Credits
    updateTimeCredits: async (userId, timeCredits, operation = 'set') => {
        try {
            const response = await API.put(`/profile/user/${userId}/time-credits`, {
                timeCredits,
                operation,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Profile Visibility
    toggleProfileVisibility: async (userId) => {
        try {
            const response = await API.put(`/profile/user/${userId}/toggle-visibility`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Analytics
    getAnalytics: async () => {
        try {
            const response = await API.get("/analytics");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default UserProfileService;