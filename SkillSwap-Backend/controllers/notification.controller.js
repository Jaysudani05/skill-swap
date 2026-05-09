const Notification = require("../models/Notification.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, skip = 0, isRead } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        let query = { userId };

        // Filter by read status if provided
        if (isRead !== undefined) {
            query.isRead = isRead === "true";
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate("relatedUser", "fullname email")
            .lean();

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: notifications,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching notifications",
            error: error.message,
        });
    }
};

// Get recent notifications (dashboard view)
exports.getRecentNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 3 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate("relatedUser", "fullname email profilePicture")
            .lean();

        const unreadCount = await Notification.countDocuments({
            userId,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching recent notifications",
            error: error.message,
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error marking notification as read",
            error: error.message,
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error marking all notifications as read",
            error: error.message,
        });
    }
};

// Create notification (internal use)
exports.createNotification = async (req, res) => {
    try {
        const {
            userId,
            type,
            title,
            message,
            relatedUser,
            relatedResourceType,
            relatedResourceId,
            data,
        } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId, title, message",
            });
        }

        const notification = new Notification({
            userId,
            type,
            title,
            message,
            relatedUser,
            relatedResourceType,
            relatedResourceId,
            data,
        });

        const savedNotification = await notification.save();
        await savedNotification.populate("relatedUser", "fullname email");

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: savedNotification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating notification",
            error: error.message,
        });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting notification",
            error: error.message,
        });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const unreadCount = await Notification.countDocuments({
            userId,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error getting unread count",
            error: error.message,
        });
    }
};
