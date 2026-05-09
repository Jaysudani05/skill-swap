const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const auth = require("../middleware/auth");

// Get recent notifications for dashboard
router.get("/recent/:userId", auth, notificationController.getRecentNotifications);

// Get all notifications with pagination
router.get("/:userId", auth, notificationController.getNotifications);

// Get unread notification count
router.get("/count/:userId", auth, notificationController.getUnreadCount);

// Create notification (admin/internal)
router.post("/", auth, notificationController.createNotification);

// Mark notification as read
router.put("/:notificationId/read", auth, notificationController.markAsRead);

// Mark all notifications as read
router.put("/:userId/read-all", auth, notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", auth, notificationController.deleteNotification);

module.exports = router;
