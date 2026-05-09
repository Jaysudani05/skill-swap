const SwapRequestSchemaModel = require("../models/SwapRequest.model");
const UserProfileModel = require("../models/UserProfile.model");
const ChatModel = require("../models/Chat.model");
const Notification = require("../models/Notification.model");
const User = require("../models/User.model");

// POST /api/swap-requests
exports.sendRequest = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        const requesterId = req.user.id;

        // Check if recipient exists and has a public profile
        const recipient = await UserProfileModel.findOne({
            userId: recipientId,
            isProfilePublic: true
        });

        if (!recipient) {
            return res.status(404).json({ error: "User not found or profile is private" });
        }

        // Prevent users from sending requests to themselves
        if (requesterId === recipientId) {
            return res.status(400).json({ error: "Cannot send request to yourself" });
        }

        // Check for existing pending request
        const existingRequest = await SwapRequestSchemaModel.findOne({
            requester: requesterId,
            recipient: recipientId,
            status: 0
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Request already pending" });
        }

        // Create new swap request
        const swapRequest = new SwapRequestSchemaModel({
            requester: requesterId,
            recipient: recipientId,
            message: message || "",
        });

        await swapRequest.save();

        // Populate the request with user details for response
        await swapRequest.populate([
            { path: 'requester', select: 'username' },
            { path: 'recipient', select: 'username' }
        ]);

        // Create Notification for recipient
        const requester = await User.findById(requesterId);
        const notification = new Notification({
            userId: recipientId,
            type: "connection_request",
            title: "New Connection Request",
            message: `${requester.username} sent you a connection request`,
            relatedUser: requesterId,
            relatedResourceType: "SwapRequest",
            relatedResourceId: swapRequest._id,
            data: { message: message || "" }
        });
        await notification.save();

        res.status(201).json({
            message: "Swap request sent successfully",
            swapRequest
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// PATCH /api/swap-requests/:requestId/respond
exports.respondToSwapRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        const userId = req.user.id;

        const swapRequest = await SwapRequestSchemaModel.findById(requestId);

        if (!swapRequest) {
            return res.status(404).json({ error: "Swap request not found" });
        }

        // Only recipient can respond to the request
        if (swapRequest.recipient.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized to respond to this request" });
        }

        // Can only respond to pending requests
        if (swapRequest.status !== 0) {
            return res.status(400).json({ error: "Request is no longer pending" });
        }

        // Update status based on action
        swapRequest.status = action === 'accept' ? 1 : 2;
        swapRequest.statusUpdatedAt = new Date();

        await swapRequest.save();

        // If accepted, create a chat for the participants
        if (action === 'accept') {
            try {
                // Check if chat already exists
                const existingChat = await ChatModel.findOne({ swapRequest: requestId });
                if (!existingChat) {
                    // Create new chat
                    const chat = new ChatModel({
                        swapRequest: requestId,
                        participants: [swapRequest.requester, swapRequest.recipient]
                    });
                    await chat.save();
                }
            } catch (chatError) {
                console.error('Error creating chat:', chatError);
                // Don't fail the request acceptance if chat creation fails
            }
        }

        // Create Notification for requester
        const responder = await User.findById(userId);
        const notification = new Notification({
            userId: swapRequest.requester,
            type: action === 'accept' ? "connection_accepted" : "activity",
            title: action === 'accept' ? "Connection Request Accepted" : "Connection Request Rejected",
            message: `${responder.username} ${action}ed your connection request`,
            relatedUser: userId,
            relatedResourceType: "SwapRequest",
            relatedResourceId: swapRequest._id
        });
        await notification.save();

        res.json({
            message: `Swap request ${action}ed successfully`,
            swapRequest
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/swap-requests
exports.getSwapRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'all', status } = req.query; // type: 'sent', 'received', 'all'

        let query = {};

        // Filter by request type
        if (type === 'sent') {
            query.requester = userId;
        } else if (type === 'received') {
            query.recipient = userId;
        } else {
            query.$or = [{ requester: userId }, { recipient: userId }];
        }

        // Filter by status if provided
        if (status !== undefined) {
            query.status = parseInt(status);
        }

        const swapRequests = await SwapRequestSchemaModel.find(query)
            .populate('requester', 'username')
            .populate('recipient', 'username')
            .sort({ createdAt: -1 });
        res.json({ swapRequests });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/swap-requests/:requestId
exports.cancelSwapRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const swapRequest = await SwapRequestSchemaModel.findById(requestId);

        if (!swapRequest) {
            return res.status(404).json({ error: "Swap request not found" });
        }

        // Only requester can cancel, and only if it's still pending
        if (swapRequest.requester.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized to cancel this request" });
        }

        if (swapRequest.status !== 0) {
            return res.status(400).json({ error: "Can only cancel pending requests" });
        }

        swapRequest.status = 3; // cancelled
        swapRequest.statusUpdatedAt = new Date();
        await swapRequest.save();

        // Create Notification for recipient
        const canceller = await User.findById(userId);
        const notification = new Notification({
            userId: swapRequest.recipient,
            type: "activity",
            title: "Connection Request Cancelled",
            message: `${canceller.username} cancelled a connection request`,
            relatedUser: userId,
            relatedResourceType: "SwapRequest",
            relatedResourceId: swapRequest._id
        });
        await notification.save();

        res.json({ message: "Swap request cancelled successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

