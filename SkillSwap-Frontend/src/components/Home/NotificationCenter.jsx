import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

// Notifications Component
const NotificationCenter = ({ notifications, userId }) => {
    const navigate = useNavigate();

    if (!notifications || notifications.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center space-x-3 p-4 text-center text-gray-500">
                    <Bell className="h-5 w-5" />
                    <p>No notifications yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {notifications.length}
                </span>
            </div>

            <div className="space-y-3">
                {notifications.slice(0, 3).map((notification, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            {notifications.length > 3 && (
                <button
                    onClick={() => navigate("/notifications")}
                    className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                >
                    View all notifications →
                </button>
            )}
        </div>
    );
};

export default NotificationCenter;
