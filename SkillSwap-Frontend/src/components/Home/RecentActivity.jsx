import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

// Recent Activity Component
const RecentActivity = ({ activities, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <Link
          to="/notifications"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-5 overflow-y-auto flex-1 pr-2 custom-scrollbar">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <Activity className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No recent activity to display.</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 group translate-all duration-200">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 border-b border-gray-50 pb-3 group-last:border-0 group-last:pb-0">
                <p className="text-sm text-gray-800 font-medium group-hover:text-blue-900 transition-colors">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;