import React, { useState } from 'react';
import { ChatAlt2Icon } from '@heroicons/react/outline';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const Chat = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [isMobileView, setIsMobileView] = useState(false);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setIsMobileView(true);
    };

    const handleBackToList = () => {
        setSelectedChat(null);
        setIsMobileView(false);
    };

    const handleChatDeleted = (deletedChatId) => {
        // If the deleted chat was selected, clear selection
        if (selectedChat && selectedChat._id === deletedChatId) {
            setSelectedChat(null);
            setIsMobileView(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center space-x-2">
                    <ChatAlt2Icon className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Layout */}
                <div className="hidden md:flex flex-1">
                    {/* Chat List - Desktop */}
                    <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
                        <ChatList 
                            onSelectChat={handleSelectChat}
                            selectedChatId={selectedChat?._id}
                        />
                    </div>

                    {/* Chat Window - Desktop */}
                    <div className="flex-1">
                        <ChatWindow 
                            chat={selectedChat}
                            onBack={handleBackToList}
                            onChatDeleted={handleChatDeleted}
                        />
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex-1">
                    {!isMobileView ? (
                        <div className="h-full bg-gray-50 p-4">
                            <ChatList 
                                onSelectChat={handleSelectChat}
                                selectedChatId={selectedChat?._id}
                            />
                        </div>
                    ) : (
                        <ChatWindow 
                            chat={selectedChat}
                            onBack={handleBackToList}
                            onChatDeleted={handleChatDeleted}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
