const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        // User who receives the notification
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Type of notification
        type: {
            type: String,
            enum: [
                "profile_complete",
                "skill_match",
                "connection_request",
                "connection_accepted",
                "message",
                "swap_request",
                "swap_completed",
                "new_feature",
                "activity",
                "security",
            ],
            default: "activity",
        },

        // Title/Subject of notification
        title: {
            type: String,
            required: true,
        },

        // Detailed message
        message: {
            type: String,
            required: true,
        },

        // Related user (who triggered the action)
        relatedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // Related resource (optional - could be SwapRequest, Chat, etc)
        relatedResourceType: {
            type: String,
            enum: ["SwapRequest", "Chat", "Profile", "Message"],
        },
        relatedResourceId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        // Is notification read
        isRead: {
            type: Boolean,
            default: false,
        },

        // When it should be cleared/auto-delete
        expiresAt: {
            type: Date,
        },

        // Additional data for notification
        data: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
