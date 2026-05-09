import React, { useState, useEffect, useCallback } from 'react';
import { ChatAlt2Icon, UserIcon, ClockIcon, TrashIcon } from '@heroicons/react/outline';
import { Loader2 } from 'lucide-react';
import ChatService from '../../services/chat.service';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChatList = ({ onSelectChat, selectedChatId }) => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingChatId, setDeletingChatId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await ChatService.getUserChats();
            if (result.success) {
                setChats(result.data);
            } else {
                setError(result.error || 'Failed to fetch chats');
            }
        } catch (err) {
            setError('Failed to fetch chats');
            console.error('Error fetching chats:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // Real-time message handling for chat list updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleMessageReceived = (messageData) => {
            console.log('Real-time message received in chat list:', messageData);

            // Update the chat's last message timestamp, unread count, and move it to the top
            setChats(prev => {
                const updatedChats = prev.map(chat => {
                    const incomingChatId = messageData.chat || messageData.chatId;
                    if (chat._id === incomingChatId) {
                        // Increment unread count only if it is not the currently opened chat
                        const isCurrentlyOpen = chat._id === selectedChatId;
                        const isFromMe = String(messageData.sender?._id) === String(user?._id || user?.id);

                        let newUnreadCount = chat.unreadCount || 0;
                        if (!isCurrentlyOpen && !isFromMe) {
                            newUnreadCount += 1;
                        }

                        return {
                            ...chat,
                            lastMessageAt: messageData.createdAt,
                            unreadCount: newUnreadCount
                        };
                    }
                    return chat;
                });

                // Sort by last message time (most recent first)
                return updatedChats.sort((a, b) =>
                    new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
                );
            });
        };

        socket.on('message_received', handleMessageReceived);

        return () => {
            socket.off('message_received', handleMessageReceived);
        };
    }, [socket, isConnected, selectedChatId]); // ADDED selectedChatId to dependency array

    // Clear unread count when a chat is selected
    useEffect(() => {
        if (selectedChatId) {
            setChats(prev => prev.map(chat =>
                chat._id === selectedChatId ? { ...chat, unreadCount: 0 } : chat
            ));
        }
    }, [selectedChatId]);

    const formatLastMessageTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getOtherParticipant = (chat) => {
        if (!chat.participants || !user) return null;
        return chat.participants.find(p => p._id !== user._id);
    };

    const handleDeleteChat = async (chatId) => {
        setDeletingChatId(chatId);
        try {
            const result = await ChatService.deleteChat(chatId);
            if (result.success) {
                // Remove the chat from the local state
                setChats(prev => prev.filter(chat => chat._id !== chatId));
                // If the deleted chat was selected, clear selection
                if (selectedChatId === chatId) {
                    onSelectChat(null);
                }
            } else {
                setError(result.error || 'Failed to delete chat');
            }
        } catch (err) {
            setError('Failed to delete chat');
            console.error('Error deleting chat:', err);
        } finally {
            setDeletingChatId(null);
            setShowDeleteConfirm(null);
        }
    };

    const handleDeleteClick = (e, chatId) => {
        e.stopPropagation(); // Prevent chat selection
        setShowDeleteConfirm(chatId);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchChats}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="text-center py-8">
                <ChatAlt2Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active chats</p>
                <p className="text-gray-500 text-sm">Start a conversation by accepting a swap request</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                    <span className="text-xs text-gray-500">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {chats.map((chat) => {
                const otherParticipant = getOtherParticipant(chat);
                const isSelected = selectedChatId === chat._id;
                const isDeleting = deletingChatId === chat._id;
                const showConfirm = showDeleteConfirm === chat._id;

                return (
                    <div
                        key={chat._id}
                        onClick={() => !showConfirm && onSelectChat(chat)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors relative ${isSelected
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                            } ${showConfirm ? 'bg-red-50 border-red-200' : ''}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                        {otherParticipant?.username || 'Unknown User'}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500">
                                            {formatLastMessageTime(chat.lastMessageAt)}
                                        </span>
                                        {!showConfirm && (
                                            <button
                                                onClick={(e) => handleDeleteClick(e, chat._id)}
                                                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                                title="Delete chat"
                                            >
                                                <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 truncate">
                                        Swap Request Chat
                                    </p>
                                    {chat.unreadCount > 0 && (
                                        <div className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Delete Confirmation */}
                        {showConfirm && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800 mb-3">
                                    Are you sure you want to delete this chat? This action cannot be undone.
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleDeleteChat(chat._id)}
                                        disabled={isDeleting}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <div className="flex items-center space-x-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>Deleting...</span>
                                            </div>
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelDelete}
                                        disabled={isDeleting}
                                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList;
