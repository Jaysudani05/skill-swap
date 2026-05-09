// pages/Stats.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import QuickStats from "../components/Home/QuickStats";
import RecentActivity from "../components/Home/RecentActivity";
import UserProfileService from "../services/userProfile.service";
import { Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// utility to convert ISO date to relative time string
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
  return seconds + " seconds ago";
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Stats = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: { connections: 0, profileViews: 0, messages: 0 },
    activities: [],
    chartData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await UserProfileService.getAnalytics();
        // convert activity times to relative strings
        const activities = res.activities.map((a) => ({
          message: a.message,
          time: timeAgo(a.time),
        }));
        setDashboardData({
          stats: res.stats,
          activities,
          chartData: res.chartData || []
        });
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Crunching your numbers...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg my-6 mx-4 md:mx-0 border border-red-200">
          <p className="font-semibold">Error Loading Analytics</p>
          <p className="text-sm">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Visualize your profile performance and network growth.</p>
      </div>

      {/* Top Stat Cards Layer */}
      <QuickStats stats={dashboardData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-stretch">

        {/* Main Graph Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* View Trends Graph */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Engagement</h3>
              <p className="text-sm text-gray-500">Profile views vs Messages sent to you over the past week.</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart
                  data={dashboardData.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" name="Profile Views" dataKey="views" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" name="Messages" dataKey="messages" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorMessages)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Connection Activity Graph */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Network Growth</h3>
              <p className="text-sm text-gray-500">Connections formed based on skill swaps.</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Connections" dataKey="connections" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side Column */}
        <div className="lg:col-span-1 flex flex-col space-y-8">

          {/* Active Summary Block */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white text-center flex-shrink-0">
            <h3 className="text-lg font-medium text-blue-100 mb-2">Total Momentum</h3>
            <p className="text-5xl font-bold mb-4">{dashboardData.stats.connections + dashboardData.stats.messages}</p>
            <p className="text-sm text-blue-200">Total verified interactive interactions within the Skill Swap ecosystem</p>
          </div>

          {/* Existing Recent Activity */}
          <RecentActivity
            activities={dashboardData.activities}
            className="flex-1"
          />

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Stats;
