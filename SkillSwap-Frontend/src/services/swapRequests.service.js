import API from "../APIs/api";

// Define outside the service object or as a static method
const getStatusString = (numericStatus) => {
    switch (numericStatus) {
        case 0: return 'pending';
        case 1: return 'accepted';
        case 2: return 'rejected';
        case 3: return 'cancelled';
        default: return 'unknown';
    }
};

const SwapRequestsService = {
    /**
     * Send a new swap request
     * @param {string} recipientId - ID of the user to send request to
     * @param {string} message - Optional message with the request
     * @returns {Promise} API response
     */
    sendRequest: async (recipientId, message = "") => {
        try {
            const response = await API.post('/swap-requests', {
                recipientId,
                message
            });

            return {
                success: true,
                data: response.data,
                message: response.data.message
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to send request',
                status: error.response?.status
            };
        }
    },


    /**
     * Get swap requests (sent, received, or all)
     * @param {string} type - 'sent', 'received', or 'all' (default: 'all')
     * @param {number} status - Filter by status (0: pending, 1: accepted, 2: rejected, 3: cancelled)
     * @returns {Promise} API response
     */
    getSwapRequests: async (type = 'all', status = null) => {
        try {
            const params = { type };
            if (status !== null) {
                params.status = status;
            }

            const response = await API.get('/swap-requests', { params });



            // Transform numeric status to string for frontend compatibility
            const transformedData = response.data.swapRequests.map(request => ({
                ...request,
                status: getStatusString(request.status)
            }));

            return {
                success: true,
                data: transformedData,
                count: transformedData.length
            };
        }
        catch (error) {
            console.error('SwapRequestsService.getSwapRequests error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch requests',
                status: error.response?.status
            };
        }
    },

    /**
     * Get received requests specifically (used by Requests component)
     * @returns {Promise} API response
     */
    getReceivedRequests: async () => {
        return await SwapRequestsService.getSwapRequests('received');
    },

    /**
     * Respond to a swap request (accept or reject)
     * @param {string} requestId - ID of the request to respond to
     * @param {string} action - 'accept' or 'reject'
     * @returns {Promise} API response
     */
    respondToRequest: async (requestId, action) => {
        try {
            const response = await API.patch(`/swap-requests/${requestId}/respond`, {
                action
            });
            return {
                success: true,
                data: response.data.swapRequest,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || `Failed to ${action} request`,
                status: error.response?.status
            };
        }
    },

    /**
     * Update request status (wrapper for respondToRequest to match component expectations)
     * @param {string} requestId - ID of the request
     * @param {string} status - 'accepted' or 'rejected'
     * @returns {Promise} API response
     */
    updateRequestStatus: async (requestId, status) => {
        const action = status === 'accepted' ? 'accept' : 'reject';
        return await SwapRequestsService.respondToRequest(requestId, action);
    },

    /**
     * Cancel a pending swap request
     * @param {string} requestId - ID of the request to cancel
     * @returns {Promise} API response
     */
    cancelRequest: async (requestId) => {
        try {
            const response = await API.delete(`/swap-requests/${requestId}`);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to cancel request',
                status: error.response?.status
            };
        }
    },

    /**
     * Get pending requests (shorthand for getSwapRequests with status filter)
     * @param {string} type - 'sent', 'received', or 'all'
     * @returns {Promise} API response
     */
    getPendingRequests: async (type = 'all') => {
        return await SwapRequestsService.getSwapRequests(type, 0);
    },

    /**
     * Get accepted requests (shorthand for getSwapRequests with status filter)
     * @param {string} type - 'sent', 'received', or 'all'
     * @returns {Promise} API response
     */
    getAcceptedRequests: async (type = 'all') => {
        return await SwapRequestsService.getSwapRequests(type, 1);
    },

    /**
     * Get rejected requests (shorthand for getSwapRequests with status filter)
     * @param {string} type - 'sent', 'received', or 'all'
     * @returns {Promise} API response
     */
    getRejectedRequests: async (type = 'all') => {
        return await SwapRequestsService.getSwapRequests(type, 2);
    },

    /**
     * Helper function to convert numeric status to string
     * @param {number} numericStatus - Numeric status from backend
     * @returns {string} String status for frontend
     */
    getStatusString: function (numericStatus) {
        const statusMap = {
            0: 'pending',
            1: 'accepted',
            2: 'rejected',
            3: 'cancelled'
        };
        return statusMap[numericStatus] || 'unknown';
    },

    /**
     * Helper function to convert string status to numeric
     * @param {string} stringStatus - String status from frontend
     * @returns {number} Numeric status for backend
     */
    getStatusNumber: function (stringStatus) {
        const statusMap = {
            'pending': 0,
            'accepted': 1,
            'rejected': 2,
            'cancelled': 3
        };
        return statusMap[stringStatus] ?? null;
    }
}

export default SwapRequestsService;
