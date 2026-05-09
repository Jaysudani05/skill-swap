const { Server } = require('socket.io');
const { createServer } = require('http');
const express = require('express');

// Create a simple test server
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Test socket connection
io.on('connection', (socket) => {
  console.log('Test client connected:', socket.id);
  
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`Client ${socket.id} joined chat ${chatId}`);
  });
  
  socket.on('new_message', (data) => {
    console.log('Message received:', data);
    socket.to(`chat_${data.chatId}`).emit('message_received', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Test client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Test Socket.IO server running on port ${PORT}`);
});
