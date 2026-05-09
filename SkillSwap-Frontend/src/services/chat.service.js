import API from "../APIs/api";

const ChatService = {
    /**
     * Create a new chat for an accepted swap request
     * @param {string} swapRequestId - ID of the accepted swap request
     * @returns {Promise} API response
     */
    createChat: async (swapRequestId) => {
        try {
            const response = await API.post('/chats', {
                swapRequestId
            });

            return {
                success: true,
                data: response.data.chat,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create chat',
                status: error.response?.status
            };
        }
    },

    /**
     * Get all chats for the current user
     * @returns {Promise} API response
     */
    getUserChats: async () => {
        try {
            const response = await API.get('/chats');

            return {
                success: true,
                data: response.data.chats
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch chats',
                status: error.response?.status
            };
        }
    },

    /**
     * Get a specific chat
     * @param {string} chatId - ID of the chat
     * @returns {Promise} API response
     */
    getChat: async (chatId) => {
        try {
            const response = await API.get(`/chats/${chatId}`);

            return {
                success: true,
                data: response.data.chat
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch chat',
                status: error.response?.status
            };
        }
    },

    /**
     * Send a message in a chat
     * @param {string} chatId - ID of the chat
     * @param {string} content - Message content
     * @param {string} type - Message type (default: 'text')
     * @returns {Promise} API response
     */
    sendMessage: async (chatId, content, type = 'text') => {
        try {
            const response = await API.post(`/chats/${chatId}/messages`, {
                content,
                type
            });

            return {
                success: true,
                data: response.data.messageData,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to send message',
                status: error.response?.status
            };
        }
    },

    /**
     * Get messages for a chat
     * @param {string} chatId - ID of the chat
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Messages per page (default: 50)
     * @returns {Promise} API response
     */
    getChatMessages: async (chatId, page = 1, limit = 50) => {
        try {
            const response = await API.get(`/chats/${chatId}/messages`, {
                params: { page, limit }
            });

            return {
                success: true,
                data: response.data.messages,
                pagination: response.data.pagination
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch messages',
                status: error.response?.status
            };
        }
    },

    /**
     * Mark a message as read
     * @param {string} chatId - ID of the chat
     * @param {string} messageId - ID of the message
     * @returns {Promise} API response
     */
    markMessageAsRead: async (chatId, messageId) => {
        try {
            const response = await API.patch(`/chats/${chatId}/messages/${messageId}/read`);

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to mark message as read',
                status: error.response?.status
            };
        }
    },

    /**
     * Archive a chat
     * @param {string} chatId - ID of the chat
     * @returns {Promise} API response
     */
    archiveChat: async (chatId) => {
        try {
            const response = await API.patch(`/chats/${chatId}/archive`);

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to archive chat',
                status: error.response?.status
            };
        }
    },

    /**
     * Delete a chat and all its messages
     * @param {string} chatId - ID of the chat
     * @returns {Promise} API response
     */
    deleteChat: async (chatId) => {
        try {
            const response = await API.delete(`/chats/${chatId}`);

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete chat',
                status: error.response?.status
            };
        }
    }
};

export default ChatService;
