import API from "../APIs/api";

const NotificationService = {
  // Get all notifications with pagination
  getAllNotifications: async (userId, limit = 10, skip = 0, isRead = null) => {
    try {
      let url = `/notifications/${userId}?limit=${limit}&skip=${skip}`;
      if (isRead !== null) {
        url += `&isRead=${isRead}`;
      }
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get recent notifications (dashboard)
  getRecentNotifications: async (userId, limit = 3) => {
    try {
      const response = await API.get(`/notifications/recent/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get unread count
  getUnreadCount: async (userId) => {
    try {
      const response = await API.get(`/notifications/count/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await API.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    try {
      const response = await API.put(`/notifications/${userId}/read-all`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create notification
  createNotification: async (notificationData) => {
    try {
      const response = await API.post("/notifications", notificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await API.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default NotificationService;
