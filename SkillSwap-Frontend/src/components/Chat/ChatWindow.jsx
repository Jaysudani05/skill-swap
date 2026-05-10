import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, ArrowLeftIcon, UserIcon, TrashIcon } from '@heroicons/react/outline';
import { Loader2, Video, Phone, VideoOff, MicOff, Mic, PhoneOff, PhoneIncoming } from 'lucide-react';
import ChatService from '../../services/chat.service';
import CallService from '../../services/call.service';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

// ─── STUN servers for WebRTC ──────────────────────────────────────────────────
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// ─── Incoming Call Modal ──────────────────────────────────────────────────────
const IncomingCallModal = ({ call, onAccept, onReject }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {call.isVideoCall ? (
                    <Video className="w-8 h-8 text-blue-600" />
                ) : (
                    <Phone className="w-8 h-8 text-blue-600" />
                )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {call.isVideoCall ? 'Incoming Video Call' : 'Incoming Audio Call'}
            </h3>
            <p className="text-gray-500 mb-8">{call.callerUsername}</p>
            <div className="flex justify-center space-x-6">
                <button
                    onClick={onReject}
                    className="flex flex-col items-center space-y-1"
                >
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                        <PhoneOff className="w-6 h-6 text-red-600" />
                    </div>
                    <span className="text-xs text-gray-500">Decline</span>
                </button>
                <button
                    onClick={onAccept}
                    className="flex flex-col items-center space-y-1"
                >
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                        <PhoneIncoming className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-500">Accept</span>
                </button>
            </div>
        </div>
    </div>
);

// ─── Active Call Modal ────────────────────────────────────────────────────────
const ActiveCallModal = ({
    isVideoCall,
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    isMuted,
    isCameraOff,
    onToggleMute,
    onToggleCamera,
    onEndCall,
    otherUsername,
    callStatus
}) => (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
        {/* Remote video (full screen background) */}
        <div className="absolute inset-0 bg-gray-800">
            {isVideoCall ? (
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <audio ref={remoteAudioRef} autoPlay playsInline />
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                        <UserIcon className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-white text-xl font-medium">{otherUsername}</p>
                    <p className="text-gray-400 text-sm mt-2">{callStatus}</p>
                </div>
            )}
        </div>

        {/* Local video (picture-in-picture) */}
        {isVideoCall && (
            <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-gray-700">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
            </div>
        )}

        {/* Call info overlay */}
        {isVideoCall && (
            <div className="absolute top-4 left-4 text-white">
                <p className="font-medium text-lg">{otherUsername}</p>
                <p className="text-sm text-gray-300">{callStatus}</p>
            </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 flex space-x-6">
            <button
                onClick={onToggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                ) : (
                    <Mic className="w-6 h-6 text-white" />
                )}
            </button>

            {isVideoCall && (
                <button
                    onClick={onToggleCamera}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                    title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                >
                    {isCameraOff ? (
                        <VideoOff className="w-6 h-6 text-white" />
                    ) : (
                        <Video className="w-6 h-6 text-white" />
                    )}
                </button>
            )}

            <button
                onClick={onEndCall}
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="End call"
            >
                <PhoneOff className="w-6 h-6 text-white" />
            </button>
        </div>
    </div>
);

// ─── ChatWindow ───────────────────────────────────────────────────────────────
const ChatWindow = ({ chat, onBack, onChatDeleted }) => {
    const { user } = useAuth();
    const { socket, isConnected, isLoading: socketLoading, joinChat, leaveChat } = useSocket();

    // ── Messaging state ────────────────────────────────────────────────────────
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // ── Call state ─────────────────────────────────────────────────────────────
    const [incomingCall, setIncomingCall] = useState(null);   // { callId, callerId, callerUsername, isVideoCall }
    const [activeCall, setActiveCall] = useState(null);        // { callId, isVideoCall, otherUserId }
    const [callStatus, setCallStatus] = useState('');          // 'Calling…', 'Connected', etc.
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    // WebRTC refs
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);

    // If offer/ICE arrives before the callee presses "Accept" (and creates the peer connection),
    // the current code would drop those events. Queue them and apply after setup.
    const pendingOfferRef = useRef(null); // { callId, callerId, offer }
    const pendingIceCandidatesRef = useRef([]); // [ { callId, candidate, ... } ]

    // Keep track for unmount cleanup
    const activeCallRef = useRef(null);
    useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);

    const incomingCallRef = useRef(null);
    useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const ensureUniqueMessages = (messages) => {
        const seen = new Set();
        return messages.filter(msg => {
            const key = `${msg._id}_${msg.content}_${msg.sender?._id}_${msg.createdAt}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const fetchMessages = useCallback(async () => {
        if (!chat) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await ChatService.getChatMessages(chat._id);
            if (result.success) {
                const uniqueMsgs = ensureUniqueMessages(result.data);
                setMessages(uniqueMsgs);

                // Asynchronously mark any received unread messages as read
                const currentUserId = user?._id || user?.id;
                uniqueMsgs.forEach(msg => {
                    if (!msg.isRead && String(msg.sender?._id) !== String(currentUserId) && msg.sender?._id !== currentUserId) {
                        ChatService.markMessageAsRead(chat._id, msg._id).catch(err => console.error("Failed to mark message as read:", err));
                    }
                });
            } else {
                setError(result.error || 'Failed to fetch messages');
            }
        } catch (err) {
            setError('Failed to fetch messages');
        } finally {
            setIsLoading(false);
        }
    }, [chat]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);
    useEffect(() => { scrollToBottom(); }, [messages]);

    // ── WebRTC helpers ─────────────────────────────────────────────────────────
    const getLocalStream = async (isVideoCall) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideoCall
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
        return stream;
    };

    const createPeerConnection = useCallback((callId, isVideoCall, otherUserId, isCallee = false) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Receive remote stream
        pc.ontrack = (event) => {
            if (isVideoCall) {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
            } else {
                if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
                // Some browsers require an explicit play() after attaching the stream.
                if (remoteAudioRef.current) remoteAudioRef.current.play().catch(() => { });
            }
            setCallStatus('Connected');
        };

        // Send ICE candidates to other peer
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                CallService.sendIceCandidate(socket, {
                    candidate: event.candidate,
                    targetUserId: otherUserId,
                    callId
                });
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                cleanupCall();
            }
        };

        return pc;
    }, [socket]);

    const cleanupCall = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        setActiveCall(null);
        setIncomingCall(null);
        setCallStatus('');
        setIsMuted(false);
        setIsCameraOff(false);

        pendingOfferRef.current = null;
        pendingIceCandidatesRef.current = [];
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    }, []);

    // ── Initiate a call ────────────────────────────────────────────────────────
    const handleStartCall = async (isVideoCall) => {
        const otherParticipant = getOtherParticipant();
        if (!otherParticipant || !socket || !isConnected) return;

        try {
            setCallStatus('Calling…');

            // Get media first
            await getLocalStream(isVideoCall);

            // Create call record in DB
            const result = await CallService.startCall(chat._id, otherParticipant._id, isVideoCall);
            if (!result.success) {
                setError(result.error);
                cleanupCall();
                return;
            }

            const callId = result.data.call._id;
            const otherUserId = otherParticipant._id;

            setActiveCall({ callId, isVideoCall, otherUserId, role: 'caller' });

            // Create peer connection
            const pc = createPeerConnection(callId, isVideoCall, otherUserId, false);

            // Notify recipient via socket
            CallService.notifyIncomingCall(socket, {
                recipientId: otherUserId,
                callId,
                isVideoCall
            });

            // Create and send SDP offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Wait briefly for socket delivery then send offer
            setTimeout(() => {
                CallService.sendOffer(socket, { offer, recipientId: otherUserId, callId });
            }, 500);

        } catch (err) {
            console.error('Error starting call:', err);
            setError('Could not start call. Please check camera/mic permissions.');
            cleanupCall();
        }
    };

    // ── Accept incoming call ───────────────────────────────────────────────────
    const handleAcceptCall = async () => {
        if (!incomingCall || !socket) return;
        const { callId, callerId, isVideoCall } = incomingCall;

        try {
            setCallStatus('Connecting…');
            await getLocalStream(isVideoCall);

            setActiveCall({ callId, isVideoCall, otherUserId: callerId, role: 'callee' });
            setIncomingCall(null);

            const pc = createPeerConnection(callId, isVideoCall, callerId, true);

            // Update DB
            await CallService.answerCall(callId, true);

            // Notify caller via socket
            CallService.notifyCallAccepted(socket, { callId, callerId });

            // Apply any offer/ICE that arrived before the callee accepted.
            if (pendingOfferRef.current?.callId === callId) {
                const pendingOffer = pendingOfferRef.current;
                pendingOfferRef.current = null;
                await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                CallService.sendAnswer(socket, {
                    answer,
                    callerId: pendingOffer.callerId,
                    callId: pendingOffer.callId,
                });
            }

            const queued = pendingIceCandidatesRef.current.filter(c => c.callId === callId);
            pendingIceCandidatesRef.current = pendingIceCandidatesRef.current.filter(c => c.callId !== callId);
            for (const candidateData of queued) {
                if (!pc.remoteDescription) {
                    pendingIceCandidatesRef.current.push(candidateData);
                    continue;
                }
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
                } catch (e) {
                    console.error('Error adding queued ICE candidate:', e);
                }
            }

        } catch (err) {
            console.error('Error accepting call:', err);
            setError('Could not accept call. Please check camera/mic permissions.');
            cleanupCall();
        }
    };

    // ── Reject incoming call ───────────────────────────────────────────────────
    const handleRejectCall = async () => {
        if (!incomingCall || !socket) return;
        const { callId, callerId } = incomingCall;

        await CallService.answerCall(callId, false);
        CallService.notifyCallRejected(socket, { callId, callerId });
        setIncomingCall(null);
    };

    // ── End active call ────────────────────────────────────────────────────────
    const handleEndCall = async () => {
        if (!activeCall) return;
        const { callId, otherUserId } = activeCall;

        await CallService.endCall(callId);
        if (socket) {
            CallService.notifyCallEnded(socket, { callId, otherUserId });
        }
        cleanupCall();
    };

    // ── Media controls ─────────────────────────────────────────────────────────
    const handleToggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(t => {
                t.enabled = !t.enabled;
            });
            setIsMuted(prev => !prev);
        }
    };

    const handleToggleCamera = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(t => {
                t.enabled = !t.enabled;
            });
            setIsCameraOff(prev => !prev);
        }
    };

    // ── Socket event listeners (messaging + call signaling) ───────────────────
    useEffect(() => {
        if (socketLoading || !socket || !chat) return;

        joinChat(chat._id);

        // ── Messaging ────────────────────────────────────────────────
        const handleMessageReceived = (messageData) => {
            const currentUserId = user?._id || user?.id;
            const isFromCurrentUser = String(messageData.sender?._id) === String(currentUserId);

            // Instantly mark as read if received while chat is active open
            if (!isFromCurrentUser && !messageData.isRead) {
                ChatService.markMessageAsRead(chat._id, messageData._id).catch(err => console.error("Live read update failed:", err));
            }

            setMessages(prev => {
                if (isFromCurrentUser) {
                    const hasOptimistic = prev.some(msg =>
                        msg.isOptimistic &&
                        msg.content === messageData.content &&
                        String(msg.sender?._id) === String(messageData.sender?._id)
                    );
                    if (hasOptimistic) {
                        return prev.map(msg =>
                            msg.isOptimistic &&
                                msg.content === messageData.content &&
                                String(msg.sender?._id) === String(messageData.sender?._id)
                                ? messageData
                                : msg
                        );
                    }
                    const exists = prev.some(msg => msg._id === messageData._id);
                    return exists ? prev : [...prev, messageData];
                } else {
                    const exists = prev.some(msg =>
                        msg._id === messageData._id ||
                        (msg.content === messageData.content &&
                            String(msg.sender?._id) === String(messageData.sender?._id) &&
                            Math.abs(new Date(msg.createdAt) - new Date(messageData.createdAt)) < 1000)
                    );
                    return exists ? ensureUniqueMessages(prev) : ensureUniqueMessages([...prev, messageData]);
                }
            });
        };

        const handleUserTyping = (data) => {
            const currentUserId = user?._id || user?.id;
            if (String(data.userId) !== String(currentUserId)) {
                setTypingUsers(prev =>
                    prev.find(u => u.userId === data.userId)
                        ? prev
                        : [...prev, { userId: data.userId, username: data.username }]
                );
            }
        };

        const handleUserStoppedTyping = (data) => {
            const currentUserId = user?._id || user?.id;
            if (String(data.userId) !== String(currentUserId)) {
                setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            }
        };

        // ── Call signaling ───────────────────────────────────────────
        const handleIncomingCall = (data) => {
            // Only show if we're in the chat with this caller
            setIncomingCall(data);
        };

        const handleCallAccepted = async (data) => {
            setCallStatus('Connecting…');
            // Offer was already sent; wait for answer SDP
        };

        const handleCallRejected = () => {
            setCallStatus('Call declined');
            setTimeout(() => cleanupCall(), 1500);
        };

        const handleCallOffer = async (data) => {
            // We're the callee; we already created a peer connection in handleAcceptCall
            const pc = peerConnectionRef.current;
            if (!pc) {
                pendingOfferRef.current = data;
                return;
            }

            // Avoid applying the same offer twice.
            if (pc.remoteDescription && pc.remoteDescription.type) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                CallService.sendAnswer(socket, {
                    answer,
                    callerId: data.callerId,
                    callId: data.callId
                });

                // Flush queued ICE candidates now that remote description exists.
                const queued = pendingIceCandidatesRef.current.filter(c => c.callId === data.callId);
                pendingIceCandidatesRef.current = pendingIceCandidatesRef.current.filter(c => c.callId !== data.callId);
                for (const candidateData of queued) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
                    } catch (e) {
                        console.error('Error adding queued ICE candidate:', e);
                    }
                }
            } catch (err) {
                console.error('Error handling offer:', err);
            }
        };

        const handleCallAnswer = async (data) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                setCallStatus('Connected');

                // Flush queued ICE candidates for this call.
                const queued = pendingIceCandidatesRef.current.filter(c => c.callId === data.callId);
                pendingIceCandidatesRef.current = pendingIceCandidatesRef.current.filter(c => c.callId !== data.callId);
                for (const candidateData of queued) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
                    } catch (e) {
                        console.error('Error adding queued ICE candidate:', e);
                    }
                }
            } catch (err) {
                console.error('Error handling answer:', err);
            }
        };

        const handleIceCandidate = async (data) => {
            const pc = peerConnectionRef.current;
            if (!data.candidate) return;
            if (!pc || !pc.remoteDescription) {
                pendingIceCandidatesRef.current.push(data);
                return;
            }
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
        };

        const handleCallEnded = () => {
            setCallStatus('Call ended');
            setTimeout(() => cleanupCall(), 1000);
        };

        // Register listeners
        socket.on('message_received', handleMessageReceived);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stopped_typing', handleUserStoppedTyping);
        socket.on('call:incoming', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('call:rejected', handleCallRejected);
        socket.on('call:offer', handleCallOffer);
        socket.on('call:answer', handleCallAnswer);
        socket.on('call:ice-candidate', handleIceCandidate);
        socket.on('call:ended', handleCallEnded);
        socket.on('test_response', (data) => console.log('Socket test response:', data));

        socket.emit('test_connection', { chatId: chat._id, userId: user?._id });

        return () => {
            // Cleanup call states if component unmounts
            if (activeCallRef.current) {
                const { callId, otherUserId } = activeCallRef.current;
                CallService.endCall(callId).catch(() => {});
                CallService.notifyCallEnded(socket, { callId, otherUserId });
            } else if (incomingCallRef.current) {
                const { callId, callerId } = incomingCallRef.current;
                CallService.answerCall(callId, false).catch(() => {});
                CallService.notifyCallRejected(socket, { callId, callerId });
            }
            cleanupCall();

            leaveChat(chat._id);
            socket.off('message_received', handleMessageReceived);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stopped_typing', handleUserStoppedTyping);
            socket.off('call:incoming', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('call:rejected', handleCallRejected);
            socket.off('call:offer', handleCallOffer);
            socket.off('call:answer', handleCallAnswer);
            socket.off('call:ice-candidate', handleIceCandidate);
            socket.off('call:ended', handleCallEnded);
            setTypingUsers([]);
            setMessages(prev => prev.filter(msg => !msg.isOptimistic));
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [socket, chat, user, joinChat, leaveChat, socketLoading, isConnected, createPeerConnection, cleanupCall]);

    // Cleanup typing timeout on unmount
    useEffect(() => () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }, []);

    // Cleanup call on unmount
    useEffect(() => () => { cleanupCall(); }, [cleanupCall]);

    // ── Message handlers ───────────────────────────────────────────────────────
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        if (socket && isConnected) {
            socket.emit('typing_stop', { chatId: chat._id });
        }

        const currentUserId = user?._id || user?.id;
        const optimisticMessage = {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            chat: chat._id,
            sender: { _id: currentUserId, username: user?.username },
            content: messageContent,
            type: 'text',
            createdAt: new Date().toISOString(),
            isRead: false,
            isOptimistic: true
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const result = await ChatService.sendMessage(chat._id, messageContent);
            if (result.success) {
                setMessages(prev => prev.map(msg =>
                    msg._id === optimisticMessage._id
                        ? { ...result.data, sender: { _id: result.data.sender._id, username: result.data.sender.username } }
                        : msg
                ));
            } else {
                setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
                setError(result.error || 'Failed to send message');
                setNewMessage(messageContent);
            }
        } catch (err) {
            setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
            setError('Failed to send message');
            setNewMessage(messageContent);
        } finally {
            setIsSending(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        if (socket && isConnected && chat) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (value.trim()) {
                socket.emit('typing_start', { chatId: chat._id });
                typingTimeoutRef.current = setTimeout(() => {
                    socket.emit('typing_stop', { chatId: chat._id });
                }, 2000);
            } else {
                socket.emit('typing_stop', { chatId: chat._id });
            }
        }
    };

    // ── Rendering helpers ──────────────────────────────────────────────────────
    const getOtherParticipant = () => {
        if (!chat?.participants || !user) return null;
        const currentUserId = user?._id || user?.id;
        return chat.participants.find(p => p._id !== currentUserId);
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handleDeleteChat = async () => {
        if (!chat) return;
        setIsDeleting(true);
        try {
            const result = await ChatService.deleteChat(chat._id);
            if (result.success) {
                if (onChatDeleted) onChatDeleted(chat._id);
                onBack();
            } else {
                setError(result.error || 'Failed to delete chat');
            }
        } catch (err) {
            setError('Failed to delete chat');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const otherParticipant = getOtherParticipant();

    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">

            {/* ── Incoming Call Modal ── */}
            {incomingCall && (
                <IncomingCallModal
                    call={incomingCall}
                    onAccept={handleAcceptCall}
                    onReject={handleRejectCall}
                />
            )}

            {/* ── Active Call Modal ── */}
            {activeCall && (
                <ActiveCallModal
                    isVideoCall={activeCall.isVideoCall}
                    localVideoRef={localVideoRef}
                    remoteVideoRef={remoteVideoRef}
                    remoteAudioRef={remoteAudioRef}
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    onToggleMute={handleToggleMute}
                    onToggleCamera={handleToggleCamera}
                    onEndCall={handleEndCall}
                    otherUsername={otherParticipant?.username || 'User'}
                    callStatus={callStatus}
                />
            )}

            {/* ── Chat Header ── */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onBack}
                            className="p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {otherParticipant?.username || 'Unknown User'}
                                </h3>
                                {socketLoading ? (
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Connecting..." />
                                ) : (
                                    <div
                                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                                        title={isConnected ? 'Connected' : 'Disconnected'}
                                    />
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Swap Request Chat</p>
                        </div>
                    </div>

                    {/* Call + Delete buttons */}
                    <div className="flex items-center space-x-1">
                        {/* Audio Call */}
                        <button
                            onClick={() => handleStartCall(false)}
                            disabled={!isConnected || !!activeCall}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Audio call"
                        >
                            <Phone className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Video Call */}
                        <button
                            onClick={() => handleStartCall(true)}
                            disabled={!isConnected || !!activeCall}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Video call"
                        >
                            <Video className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Delete chat */}
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete chat"
                        >
                            <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Messages ── */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={fetchMessages} className="text-blue-600 hover:text-blue-800 text-sm">
                            Try again
                        </button>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No messages yet</p>
                        <p className="text-gray-500 text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {(() => {
                            const currentUserId = user?._id || user?.id;
                            const firstUnreadIndex = messages.findIndex(msg =>
                                !msg.isRead &&
                                String(msg.sender?._id) !== String(currentUserId) &&
                                msg.sender?._id !== currentUserId
                            );

                            const unreadCount = firstUnreadIndex !== -1 ? messages.length - firstUnreadIndex : 0;

                            return messages.map((message, index) => {
                                const uniqueKey = `${message._id}_${index}_${message.isOptimistic ? 'opt' : 'real'}`;
                                const isOwnMessage =
                                    String(message.sender?._id) === String(currentUserId) ||
                                    message.sender?._id === currentUserId;

                                const showUnreadSeparator = index === firstUnreadIndex;

                                return (
                                    <React.Fragment key={uniqueKey}>
                                        {showUnreadSeparator && (
                                            <div className="flex justify-center my-4">
                                                <div className="bg-green-100 text-green-800 border border-green-200 text-xs font-semibold px-3 py-1 rounded-lg shadow-sm z-10 text-center">
                                                    {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {formatMessageTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            });
                        })()}

                        {typingUsers.length > 0 && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        {typingUsers.map(u => u.username).join(', ')}{' '}
                                        {typingUsers.length === 1 ? 'is' : 'are'} typing...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Message Input ── */}
            <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <PaperAirplaneIcon className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <TrashIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Delete Chat</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-6">
                            Are you sure you want to delete this chat? All messages will be permanently removed.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDeleteChat}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isDeleting ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Deleting...</span>
                                    </div>
                                ) : (
                                    'Delete Chat'
                                )}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
