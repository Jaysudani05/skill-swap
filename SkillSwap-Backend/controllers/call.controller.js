const CallModel = require('../models/Call.model');
const ChatModel = require('../models/Chat.model');

// POST /api/calls/start - Start a new call
exports.startCall = async (req, res) => {
    try {
        const { chatId, recipientId, isVideoCall = true } = req.body;
        const callerId = req.user.id;

        // Verify the chat exists and user is a participant
        const chat = await ChatModel.findOne({
            _id: chatId,
            participants: { $in: [callerId, recipientId] },
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found or user not authorized' });
        }

        // Check if there's already an active call for this chat
        const existingCall = await CallModel.findOne({
            chatId: chatId,
            status: { $in: ['initiated', 'ringing', 'answered'] }
        });

        if (existingCall) {
            return res.status(400).json({ error: 'A call is already active for this chat' });
        }

        // Create new call
        const call = new CallModel({
            chatId,
            caller: callerId,
            recipient: recipientId,
            isVideoCall,
            status: 'initiated'
        });

        await call.save();

        // Populate the call with user details
        await call.populate([
            { path: 'caller', select: 'username' },
            { path: 'recipient', select: 'username' }
        ]);

        res.status(201).json({
            message: 'Call initiated successfully',
            call
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/calls/:callId/answer - Answer a call
exports.answerCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const { accept } = req.body;
        const userId = req.user.id;

        const call = await CallModel.findOne({
            _id: callId,
            $or: [{ caller: userId }, { recipient: userId }]
        });

        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        if (call.status !== 'initiated' && call.status !== 'ringing') {
            return res.status(400).json({ error: 'Call is not in a state to be answered' });
        }

        // Only the recipient can answer
        if (call.recipient.toString() !== userId) {
            return res.status(403).json({ error: 'Only the recipient can answer this call' });
        }

        if (accept) {
            call.status = 'answered';
        } else {
            call.status = 'rejected';
            call.endedAt = new Date();
        }

        await call.save();

        res.json({
            message: accept ? 'Call accepted' : 'Call rejected',
            call
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/calls/:callId/end - End a call
exports.endCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user.id;

        const call = await CallModel.findOne({
            _id: callId,
            $or: [{ caller: userId }, { recipient: userId }]
        });

        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        if (call.status === 'ended') {
            return res.status(400).json({ error: 'Call has already ended' });
        }

        call.status = 'ended';
        call.endedAt = new Date();
        
        // Calculate duration
        if (call.startedAt) {
            call.duration = Math.floor((call.endedAt - call.startedAt) / 1000);
        }

        await call.save();

        res.json({
            message: 'Call ended successfully',
            call
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/calls/active - Get active calls for user
exports.getActiveCalls = async (req, res) => {
    try {
        const userId = req.user.id;

        const calls = await CallModel.find({
            $or: [{ caller: userId }, { recipient: userId }],
            status: { $in: ['initiated', 'ringing', 'answered'] }
        })
        .populate([
            { path: 'caller', select: 'username' },
            { path: 'recipient', select: 'username' },
            { path: 'chatId', select: 'participants' }
        ])
        .sort({ startedAt: -1 });

        res.json({ calls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/calls/history - Get call history for user
exports.getCallHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const calls = await CallModel.find({
            $or: [{ caller: userId }, { recipient: userId }],
            status: { $in: ['answered', 'rejected', 'ended', 'missed'] }
        })
        .populate([
            { path: 'caller', select: 'username' },
            { path: 'recipient', select: 'username' }
        ])
        .sort({ startedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await CallModel.countDocuments({
            $or: [{ caller: userId }, { recipient: userId }],
            status: { $in: ['answered', 'rejected', 'ended', 'missed'] }
        });

        res.json({
            calls,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/calls/:callId/signaling - Handle WebRTC signaling
exports.handleSignaling = async (req, res) => {
    try {
        const { callId } = req.params;
        const { type, data } = req.body;
        const userId = req.user.id;

        const call = await CallModel.findOne({
            _id: callId,
            $or: [{ caller: userId }, { recipient: userId }]
        });

        if (!call) {
            return res.status(404).json({ error: 'Call not found' });
        }

        // Update signaling data based on type
        switch (type) {
            case 'offer':
                call.signalingData.offer = data;
                break;
            case 'answer':
                call.signalingData.answer = data;
                break;
            case 'ice-candidate':
                call.signalingData.iceCandidates.push({
                    candidate: data,
                    timestamp: new Date()
                });
                break;
            default:
                return res.status(400).json({ error: 'Invalid signaling type' });
        }

        await call.save();

        res.json({
            message: 'Signaling data updated successfully',
            call
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

