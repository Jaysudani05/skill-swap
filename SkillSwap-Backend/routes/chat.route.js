const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create a new chat for an accepted swap request
router.post("/", chatController.createChat);

// Get all chats for the current user
router.get("/", chatController.getUserChats);

// Get a specific chat
router.get("/:chatId", chatController.getChat);

// Send a message
router.post("/:chatId/messages", chatController.sendMessage);

// Get messages for a chat
router.get("/:chatId/messages", chatController.getChatMessages);

// Mark message as read
router.patch("/:chatId/messages/:messageId/read", chatController.markMessageAsRead);

// Archive a chat
router.patch("/:chatId/archive", chatController.archiveChat);

// Delete a chat
router.delete("/:chatId", chatController.deleteChat);

module.exports = router;
