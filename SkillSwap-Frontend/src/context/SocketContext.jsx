import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token, loading } = useAuth();
  
  // Debug logging
  console.log('SocketContext - User:', user);
  console.log('SocketContext - Token:', token ? 'Present' : 'Missing');
  console.log('SocketContext - Loading:', loading);

  useEffect(() => {
    // Don't try to connect if still loading or if no user/token
    if (loading) {
      console.log('SocketContext - Still loading, waiting...');
      return;
    }

    if (user && token) {
      console.log('SocketContext - Creating socket connection with token');
      // Create socket connection with authentication
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        console.log('User authenticated:', user.username);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type
        });
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // If no user or token, close existing socket
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, loading]);

  const joinChat = (chatId) => {
    if (socket && isConnected) {
      console.log('Joining chat:', chatId);
      socket.emit('join_chat', chatId);
    } else {
      console.log('Cannot join chat - socket not connected:', { socket: !!socket, isConnected });
    }
  };

  const leaveChat = (chatId) => {
    if (socket && isConnected) {
      console.log('Leaving chat:', chatId);
      socket.emit('leave_chat', chatId);
    } else {
      console.log('Cannot leave chat - socket not connected:', { socket: !!socket, isConnected });
    }
  };

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      console.log('Sending message via socket:', messageData);
      socket.emit('new_message', messageData);
    } else {
      console.log('Cannot send message - socket not connected:', { socket: !!socket, isConnected });
    }
  };

  const startTyping = (chatId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { chatId });
    }
  };

  const value = {
    socket,
    isConnected,
    isLoading: loading,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
