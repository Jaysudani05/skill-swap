import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import Chat from '../components/Chat/Chat';

const ChatPage = () => {
    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-12rem)] -mt-4 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                <Chat />
            </div>
        </DashboardLayout>
    );
};

export default ChatPage;
