const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
    {
        // Who is sending request
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Who is receiving the request
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true,
        },

        // Current status of the request
        status: {
            type: Number,
            enum: [0, 1, 2, 3], // 0: pending, 1: accepted, 2: rejected, 3: cancelled
            default: 0,
        },

        // Optional message from requester
        message: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        // Track when request expires (optional)
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },

        // When the status was last updated
        statusUpdatedAt: {
            type: Date,
            default: () => new Date(),
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate pending requests
swapRequestSchema.index(
    { requester: 1, recipient: 1, status: 1 },
    { 
        unique: true,
        partialFilterExpression: { status: 0 } // Only enforce uniqueness for pending requests
    }
);

module.exports = mongoose.model("SwapRequest", swapRequestSchema);