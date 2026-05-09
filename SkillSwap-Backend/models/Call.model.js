const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isVideoCall: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['initiated', 'ringing', 'answered', 'rejected', 'ended', 'missed'],
        default: 'initiated'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    signalingData: {
        offer: mongoose.Schema.Types.Mixed,
        answer: mongoose.Schema.Types.Mixed,
        iceCandidates: [mongoose.Schema.Types.Mixed]
    }
}, {
    timestamps: true
});

// Index for efficient queries
callSchema.index({ chatId: 1, status: 1 });
callSchema.index({ caller: 1, status: 1 });
callSchema.index({ recipient: 1, status: 1 });

module.exports = mongoose.model('Call', callSchema);

