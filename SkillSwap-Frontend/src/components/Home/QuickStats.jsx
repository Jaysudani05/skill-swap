import {
  Users,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

// Quick Stats Component
const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Connections</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.connections}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Profile Views</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.profileViews}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Messages</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.messages}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default QuickStats;