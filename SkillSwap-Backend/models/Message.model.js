const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        // The chat this message belongs to
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true
        },

        // Who sent the message
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Message content
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        // Message type (text, image, file, etc.)
        type: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text'
        },

        // For file attachments
        attachment: {
            filename: String,
            originalName: String,
            mimeType: String,
            size: Number,
            url: String
        },

        // Whether the message has been read by the recipient
        isRead: {
            type: Boolean,
            default: false
        },

        // When the message was read
        readAt: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isRead: 1 });

module.exports = mongoose.model("Message", messageSchema);
