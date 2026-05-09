// components/Requests/Requests.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckIcon,
    XIcon,
    ClockIcon,
    UserIcon,
    MailIcon,
    CalendarIcon,
    ExclamationCircleIcon
} from '@heroicons/react/outline';
import { Loader2 } from 'lucide-react';
import SwapRequestsService from '../../services/swapRequests.service';
import DashboardLayout from '../Layout/DashboardLayout';
import RequestCard from './RequestCard';
import Chat from '../Chat/Chat';
import { useAuth } from '../../context/AuthContext';

// Success/Error Notifications (same as in PublicProfiles)
const ErrorNotification = ({ message, onClose, isVisible }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => onClose(), 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 min-w-80">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="text-white hover:text-red-200">✕</button>
        </div>
    );
};

const SuccessNotification = ({ message, onClose, isVisible }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 min-w-80">
            <div className="w-5 h-5 flex-shrink-0 rounded-full bg-white text-green-500 flex items-center justify-center text-sm font-bold">✓</div>
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="text-white hover:text-green-200">✕</button>
        </div>
    );
};
 

// Empty State Component
const EmptyState = ({ activeTab }) => (
    <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <ClockIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab} requests
        </h3>
        <p className="text-gray-600">
            {activeTab === 'pending'
                ? 'You have no pending skill swap requests at the moment.'
                : `You have no ${activeTab} requests to display.`
            }
        </p>
    </div>
);

// Main Requests Component
const Requests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [viewType, setViewType] = useState('received'); // 'received' | 'sent'
    const [error, setError] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);

    // Notifications
    const [errorNotification, setErrorNotification] = useState({ show: false, message: '' });
    const [successNotification, setSuccessNotification] = useState({ show: false, message: '' });

    const showErrorNotification = useCallback((message) => {
        setErrorNotification({ show: true, message });
    }, []);

    const hideErrorNotification = useCallback(() => {
        setErrorNotification({ show: false, message: '' });
    }, []);

    const showSuccessNotification = useCallback((message) => {
        setSuccessNotification({ show: true, message });
    }, []);

    const hideSuccessNotification = useCallback(() => {
        setSuccessNotification({ show: false, message: '' });
    }, []);

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await SwapRequestsService.getSwapRequests(viewType);
            if (result.success) {
                // Hide cancelled requests from all views
                const visibleRequests = Array.isArray(result.data)
                    ? result.data.filter(r => r.status !== 'cancelled')
                    : [];
                setRequests(visibleRequests);
            } else {
                setError(result.error || 'Failed to fetch requests');
            }
        } catch (err) {
            setError('Failed to fetch requests');
            console.error('Error fetching requests:', err);
        } finally {
            setIsLoading(false);
        }
    }, [viewType]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Handle accept request
    const handleAcceptRequest = useCallback(async (requestId) => {
        setActionLoading(requestId);
        try {
            const result = await SwapRequestsService.updateRequestStatus(requestId, 'accepted');
            if (result.success) {
                showSuccessNotification('Request accepted successfully!');
                await fetchRequests(); // Refresh the list
            } else {
                showErrorNotification(result.error || 'Failed to accept request');
            }
        } catch (error) {
            showErrorNotification('Failed to accept request');
            console.error('Error accepting request:', error);
        } finally {
            setActionLoading(null);
        }
    }, [fetchRequests, showSuccessNotification, showErrorNotification]);

    // Handle reject request
    const handleRejectRequest = useCallback(async (requestId) => {
        setActionLoading(requestId);
        try {
            const result = await SwapRequestsService.updateRequestStatus(requestId, 'rejected');
            if (result.success) {
                showSuccessNotification('Request rejected');
                await fetchRequests(); // Refresh the list
            } else {
                showErrorNotification(result.error || 'Failed to reject request');
            }
        } catch (error) {
            showErrorNotification('Failed to reject request');
            console.error('Error rejecting request:', error);
        } finally {
            setActionLoading(null);
        }
    }, [fetchRequests, showSuccessNotification, showErrorNotification]);

    // Handle cancel (for sent pending requests)
    const handleCancelRequest = useCallback(async (requestId) => {
        setActionLoading(requestId);
        try {
            const result = await SwapRequestsService.cancelRequest(requestId);
            if (result.success) {
                showSuccessNotification('Request cancelled');
                await fetchRequests();
            } else {
                showErrorNotification(result.error || 'Failed to cancel request');
            }
        } catch (error) {
            showErrorNotification('Failed to cancel request');
            console.error('Error cancelling request:', error);
        } finally {
            setActionLoading(null);
        }
    }, [fetchRequests, showSuccessNotification, showErrorNotification]);

    // Handle opening chat
    const handleOpenChat = useCallback((chat) => {
        setSelectedChat(chat);
        setShowChat(true);
    }, []);

    // Handle closing chat
    const handleCloseChat = useCallback(() => {
        setShowChat(false);
        setSelectedChat(null);
    }, []);

    // Filter requests based on active tab
    const filteredRequests = requests.filter(request => {
        if (activeTab === 'all') return true;
        return request.status === activeTab;
    });

    const tabs = [
        { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
        { key: 'accepted', label: 'Accepted', count: requests.filter(r => r.status === 'accepted').length },
        { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
        { key: 'all', label: 'All', count: requests.length },
    ];

    // If chat is open, show chat interface
    if (showChat) {
        return (
            <DashboardLayout>
                <div className="h-screen flex flex-col">
                    <div className="bg-white border-b border-gray-200 px-4 py-3">
                        <button
                            onClick={handleCloseChat}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            ← Back to Requests
                        </button>
                    </div>
                    <div className="flex-1">
                        <Chat />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Skill Swap Requests</h1>
                        <p className="text-gray-600 mt-2">Manage your requests</p>
                    </div>

                    {/* View Toggle and Tabs */}
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium ${viewType === 'received' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                onClick={() => setViewType('received')}
                            >
                                Received
                            </button>
                            <button
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium ${viewType === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                onClick={() => setViewType('sent')}
                            >
                                Sent
                            </button>
                        </div>
                        <div>
                        <nav className="flex flex-wrap gap-3 sm:gap-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.key
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <ExclamationCircleIcon className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading requests</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchRequests}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <EmptyState activeTab={activeTab} />
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map((request) => (
                                <RequestCard
                                    key={request._id}
                                    request={request}
                                    currentUserId={user?.id || user?._id}
                                    viewType={viewType}
                                    onAccept={handleAcceptRequest}
                                    onReject={handleRejectRequest}
                                    onCancel={handleCancelRequest}
                                    onOpenChat={handleOpenChat}
                                    isLoading={actionLoading === request._id}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <ErrorNotification
                    message={errorNotification.message}
                    isVisible={errorNotification.show}
                    onClose={hideErrorNotification}
                />
                <SuccessNotification
                    message={successNotification.message}
                    isVisible={successNotification.show}
                    onClose={hideSuccessNotification}
                />
            </div>
        </DashboardLayout>

    );
};

export default Requests;
