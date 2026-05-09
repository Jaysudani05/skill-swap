import API from '../APIs/api';

class CallService {
    // Start a call (REST – creates DB record)
    async startCall(chatId, recipientId, isVideoCall = true) {
        try {
            const response = await API.post('/calls/start', {
                chatId,
                recipientId,
                isVideoCall
            });
            return {
                success: true,
                data: response.data,
                message: 'Call initiated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to start call',
                status: error.response?.status
            };
        }
    }

    // Answer a call (REST – updates DB record)
    async answerCall(callId, accept = true) {
        try {
            const response = await API.post(`/calls/${callId}/answer`, { accept });
            return {
                success: true,
                data: response.data,
                message: accept ? 'Call accepted' : 'Call rejected'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to answer call',
                status: error.response?.status
            };
        }
    }

    // End a call (REST – updates DB record)
    async endCall(callId) {
        try {
            const response = await API.post(`/calls/${callId}/end`);
            return {
                success: true,
                data: response.data,
                message: 'Call ended'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to end call',
                status: error.response?.status
            };
        }
    }

    // Get active calls
    async getActiveCalls() {
        try {
            const response = await API.get('/calls/active');
            return {
                success: true,
                data: response.data.calls
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch active calls',
                status: error.response?.status
            };
        }
    }

    // ── WebRTC Signaling (via real Socket.IO) ─────────────────────────────────

    // Notify recipient of an incoming call
    notifyIncomingCall(socket, { recipientId, callId, isVideoCall }) {
        if (!socket) return;
        socket.emit('call:initiate', { recipientId, callId, isVideoCall });
    }

    // Notify caller that call was accepted
    notifyCallAccepted(socket, { callId, callerId }) {
        if (!socket) return;
        socket.emit('call:accepted', { callId, callerId });
    }

    // Notify caller that call was rejected
    notifyCallRejected(socket, { callId, callerId }) {
        if (!socket) return;
        socket.emit('call:rejected', { callId, callerId });
    }

    // Send WebRTC offer SDP
    sendOffer(socket, { offer, recipientId, callId }) {
        if (!socket) return;
        socket.emit('call:offer', { offer, recipientId, callId });
    }

    // Send WebRTC answer SDP
    sendAnswer(socket, { answer, callerId, callId }) {
        if (!socket) return;
        socket.emit('call:answer', { answer, callerId, callId });
    }

    // Send ICE candidate
    sendIceCandidate(socket, { candidate, targetUserId, callId }) {
        if (!socket) return;
        socket.emit('call:ice-candidate', { candidate, targetUserId, callId });
    }

    // Notify other party that call has ended
    notifyCallEnded(socket, { callId, otherUserId }) {
        if (!socket) return;
        socket.emit('call:end', { callId, otherUserId });
    }
}

export default new CallService();
