// pages/Notifications.jsx
import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useDashboard } from "../context/DashboardContext";
import NotificationService from "../services/notification.service";
import { Bell, CheckCircle, AlertCircle, Heart, MessageSquare, Users, Clock } from "lucide-react";

const Notifications = () => {
  const { user } = useDashboard();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const hasAutoMarkedRef = useRef(false);
  const limit = 10;

  // DashboardContext's `user` is a profile document (UserProfile), not the auth `User`.
  // Backend notifications use `Notification.userId` (the auth User _id), so we must read the correct id.
  const dashboardUserId = user?.userId?._id || user?._id || user?.id;

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [user, filter, page]);

  useEffect(() => {
    if (!dashboardUserId || hasAutoMarkedRef.current) return;

    const autoMarkAllAsRead = async () => {
      try {
        hasAutoMarkedRef.current = true;
        await NotificationService.markAllAsRead(dashboardUserId);
        fetchNotifications();
      } catch (error) {
        console.error("Error auto-marking notifications as read:", error);
      }
    };

    autoMarkAllAsRead();
  }, [dashboardUserId]);

  const fetchNotifications = async () => {
    try {
      if (!dashboardUserId) {
        setNotifications([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      const skip = (page - 1) * limit;
      const isRead = filter === "unread" ? false : filter === "read" ? true : null;
      
      const response = await NotificationService.getAllNotifications(
        dashboardUserId,
        limit,
        skip,
        isRead
      );
      
      setNotifications(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!dashboardUserId) return;
      await NotificationService.markAllAsRead(dashboardUserId);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { className: "h-5 w-5" };
    switch (type) {
      case "connection_accepted":
      case "connection_request":
        return <Users {...iconProps} className="h-5 w-5 text-blue-500" />;
      case "message":
        return <MessageSquare {...iconProps} className="h-5 w-5 text-green-500" />;
      case "swap_completed":
      case "swap_request":
        return <Heart {...iconProps} className="h-5 w-5 text-red-500" />;
      case "activity":
        return <Bell {...iconProps} className="h-5 w-5 text-purple-500" />;
      case "security":
        return <AlertCircle {...iconProps} className="h-5 w-5 text-red-600" />;
      default:
        return <Bell {...iconProps} className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with your activity</p>
          </div>
          {total > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => { setFilter("all"); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilter("unread"); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => { setFilter("read"); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Read
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading notifications...</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <>
            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                    className={`p-4 rounded-lg border transition cursor-pointer ${
                      notification.isRead
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="inline-block h-2 w-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
