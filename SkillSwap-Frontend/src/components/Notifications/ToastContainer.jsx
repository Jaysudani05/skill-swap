// components/Notifications/ToastContainer.jsx
import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationToast from './NotificationToast';

const ToastContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  // Only show recent unread notifications as toasts
  const recentNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3); // Show max 3 toasts

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {recentNotifications.map((notification, index) => (
        <div key={notification.id} style={{ zIndex: 50 - index }}>
          <NotificationToast
            notification={notification}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
