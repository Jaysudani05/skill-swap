const SwapRequest = require("../models/SwapRequest.model");
const Chat = require("../models/Chat.model");
const Message = require("../models/Message.model");
const UserProfile = require("../models/UserProfile.model");

// computes and returns analytics data for the authenticated user
exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // total connections (accepted swap requests involving the user)
        const connections = await SwapRequest.countDocuments({
            status: 1,
            $or: [{ requester: userId }, { recipient: userId }],
        });

        // profile views stored on the profile document
        const profileDoc = await UserProfile.findOne({ userId });
        const profileViews = profileDoc ? profileDoc.profileViews : 0;

        // find chats that involve the user
        const chats = await Chat.find({ participants: userId }).select("_id");
        const chatIds = chats.map((c) => c._id);

        // unread messages (messages sent by others that are not read yet)
        const messages = await Message.countDocuments({
            chat: { $in: chatIds },
            sender: { $ne: userId },
            isRead: false,
        });

        // build a simple recent activity feed from swap requests & messages
        let activities = [];

        const recentRequests = await SwapRequest.find({
            $or: [{ requester: userId }, { recipient: userId }],
        })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate("requester", "username")
            .populate("recipient", "username");

        recentRequests.forEach((r) => {
            if (!r.requester || !r.recipient) return; // Skip if user was deleted
            const other = r.requester._id.toString() === userId ? r.recipient : r.requester;
            let message;
            switch (r.status) {
                case 0:
                    message = `${other.username} sent you a connection request`;
                    break;
                case 1:
                    message = `${other.username} accepted your connection request`;
                    break;
                case 2:
                    message = `${other.username} rejected your connection request`;
                    break;
                case 3:
                    message = `${other.username} cancelled a connection request`;
                    break;
                default:
                    message = `Connection activity with ${other.username}`;
            }
            activities.push({ message, time: r.updatedAt || r.createdAt });
        });

        const recentMsgs = await Message.find({ chat: { $in: chatIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("sender", "username");

        recentMsgs.forEach((m) => {
            if (m.sender._id.toString() !== userId) {
                activities.push({
                    message: `${m.sender.username} sent you a message`,
                    time: m.createdAt,
                });
            }
        });

        // sort and cut to max 5
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        activities = activities.slice(0, 5);

        // --- NEW: Calculate last 7 days engagement data for graphs ---
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            // Count messages received this day
            const dailyMessages = await Message.countDocuments({
                chat: { $in: chatIds },
                sender: { $ne: userId },
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            // Count new connections (accepted requests) this day
            const dailyConnections = await SwapRequest.countDocuments({
                status: 1,
                $or: [{ requester: userId }, { recipient: userId }],
                updatedAt: { $gte: startOfDay, $lte: endOfDay }
            });

            last7Days.push({
                name: dayName,
                date: dateString,
                messages: dailyMessages,
                connections: dailyConnections,
                // Since we don't track view timestamps yet, we can't show real daily views perfectly
                // but we can show the other real interactions.
                views: Math.floor(profileViews / 7) + (i === 0 ? profileViews % 7 : 0) // rough distribution for visual
            });
        }

        return res.json({
            stats: { connections, profileViews, messages },
            activities,
            chartData: last7Days
        });
    } catch (error) {
        console.error("analytics error", error);
        res.status(500).json({ error: error.message });
    }
};
