require('dotenv').config();
const express = require("express");
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectToDB = require("./config/db");
const jwt = require('jsonwebtoken');
const UserModel = require('./models/User.model');
const app = express();
const server = createServer(app);

// Configure allowed origins for CORS / Socket.IO
const FRONTEND_ORIGIN =
  process.env.FRONTEND_URL || "http://localhost:5173";
const ALLOW_ALL_ORIGINS = process.env.CORS_ORIGIN === "*";

// Allow both production frontend and local dev
const CORS_ORIGINS = [
  FRONTEND_ORIGIN,
  "http://localhost:5173",
  "https://skill-swap-platform-frontend.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: ALLOW_ALL_ORIGINS ? true : (origin, cb) => {
    if (!origin) return cb(null, true);
    if (CORS_ORIGINS.some((allowed) => allowed === origin)) return cb(null, true);
    if (ALLOW_ALL_ORIGINS) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: ALLOW_ALL_ORIGINS ? true : CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

// Import Routes
const authRoute = require("./routes/auth.route");
const usetProfileRoutes = require("./routes/userProfile.route");
const swapRequestRoutes = require("./routes/swapRequest.route");
const chatRoutes = require("./routes/chat.route");
const callRoutes = require("./routes/call.route");
const analyticsRoutes = require("./routes/analytics.route");
const notificationRoutes = require("./routes/notification.route");
const aiRoutes = require("./routes/ai.route");

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
connectToDB();
app.use(cors({ ...corsOptions }));
app.use(morgan("dev"));

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select('_id username');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.username = user.username;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.username} connected with socket ID: ${socket.id}`);

  // Join user to their personal room for direct messages
  socket.join(`user_${socket.userId}`);

  // Join chat rooms
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.username} joined chat ${chatId}`);
  });

  // Leave chat rooms
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User ${socket.username} left chat ${chatId}`);
  });

  // Handle new messages
  socket.on('new_message', (data) => {
    // Broadcast the message to all users in the chat room
    socket.to(`chat_${data.chatId}`).emit('message_received', data);
    console.log(`Message broadcasted in chat ${data.chatId}:`, data.content);
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      userId: socket.userId,
      username: socket.username,
      chatId: data.chatId
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      username: socket.username,
      chatId: data.chatId
    });
  });

  // Test connection handler
  socket.on('test_connection', (data) => {
    console.log('Test connection received from user:', socket.userId, 'for chat:', data.chatId);
    socket.emit('test_response', {
      message: 'Connection test successful',
      userId: socket.userId,
      chatId: data.chatId
    });
  });

  // ── WebRTC Call Signaling ────────────────────────────────────────────────

  // Caller notifies recipient of an incoming call
  socket.on('call:initiate', (data) => {
    // data: { recipientId, callId, isVideoCall, callerUsername }
    console.log(`Call initiated by ${socket.username} to user ${data.recipientId}`);
    socket.to(`user_${data.recipientId}`).emit('call:incoming', {
      callId: data.callId,
      callerId: socket.userId,
      callerUsername: socket.username,
      isVideoCall: data.isVideoCall
    });
  });

  // Recipient accepted the call
  socket.on('call:accepted', (data) => {
    // data: { callId, callerId }
    console.log(`Call ${data.callId} accepted by ${socket.username}`);
    socket.to(`user_${data.callerId}`).emit('call:accepted', {
      callId: data.callId,
      recipientId: socket.userId
    });
  });

  // Recipient rejected the call
  socket.on('call:rejected', (data) => {
    // data: { callId, callerId }
    console.log(`Call ${data.callId} rejected by ${socket.username}`);
    socket.to(`user_${data.callerId}`).emit('call:rejected', {
      callId: data.callId
    });
  });

  // Relay WebRTC offer SDP
  socket.on('call:offer', (data) => {
    // data: { offer, recipientId, callId }
    console.log(`Relaying WebRTC offer to user ${data.recipientId}`);
    socket.to(`user_${data.recipientId}`).emit('call:offer', {
      offer: data.offer,
      callId: data.callId,
      callerId: socket.userId
    });
  });

  // Relay WebRTC answer SDP
  socket.on('call:answer', (data) => {
    // data: { answer, callerId, callId }
    console.log(`Relaying WebRTC answer to user ${data.callerId}`);
    socket.to(`user_${data.callerId}`).emit('call:answer', {
      answer: data.answer,
      callId: data.callId
    });
  });

  // Relay ICE candidates
  socket.on('call:ice-candidate', (data) => {
    // data: { candidate, targetUserId, callId }
    socket.to(`user_${data.targetUserId}`).emit('call:ice-candidate', {
      candidate: data.candidate,
      callId: data.callId,
      fromUserId: socket.userId
    });
  });

  // One party ended the call
  socket.on('call:end', (data) => {
    // data: { callId, otherUserId }
    console.log(`Call ${data.callId} ended by ${socket.username}`);
    socket.to(`user_${data.otherUserId}`).emit('call:ended', {
      callId: data.callId
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.username} disconnected`);
  });
});

// Make io available to other modules
app.set('io', io);

// Use Routes
app.use("/api/auth", authRoute);
app.use("/api/profile", usetProfileRoutes);
app.use("/api/swap-requests", swapRequestRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is ready`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
