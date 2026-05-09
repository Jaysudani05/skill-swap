const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        // The swap request this chat belongs to
        swapRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SwapRequest',
            required: true,
            unique: true // One chat per swap request
        },

        // Participants in the chat (requester and recipient)
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],

        // Last message timestamp for sorting
        lastMessageAt: {
            type: Date,
            default: Date.now
        },

        // Whether the chat is active (not archived)
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

// Validation to ensure exactly 2 participants
chatSchema.pre('save', function(next) {
    if (this.participants.length !== 2) {
        return next(new Error('Chat must have exactly 2 participants'));
    }
    next();
});

// Index for efficient querying
chatSchema.index({ participants: 1, isActive: 1 });
chatSchema.index({ swapRequest: 1 });

module.exports = mongoose.model("Chat", chatSchema);
