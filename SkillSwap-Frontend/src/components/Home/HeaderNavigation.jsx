// components/Home/HeaderNavigation.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  ChartBarIcon,
  LightningBoltIcon,
  BellIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  ClipboardListIcon,
  ChatAlt2Icon
} from '@heroicons/react/outline';
import SwapRequestsService from '../../services/swapRequests.service';
import ChatService from '../../services/chat.service';
import NotificationService from '../../services/notification.service';
import logo from "../assets/ss.png";

const HeaderNavigation = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({
    requests: 0,
    messages: 0,
    notifications: 0
  });

  const dashboardUserId = user?.userId?._id || user?._id || user?.id;

  const navigationItems = [
    { name: 'Public Profiles', href: '/public-profiles', icon: UsersIcon },
    { name: 'Requests', href: '/requests', icon: ClipboardListIcon },
    { name: 'Messages', href: '/chat', icon: ChatAlt2Icon },
    { name: 'Analytics', href: '/stats', icon: ChartBarIcon },
    { name: 'Actions', href: '/actions', icon: LightningBoltIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
  ];

  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        const [requestsResult, chatsResult, notificationsResult] = await Promise.all([
          SwapRequestsService.getPendingRequests('received'),
          ChatService.getUserChats(),
          dashboardUserId ? NotificationService.getUnreadCount(dashboardUserId) : Promise.resolve({ count: 0 })
        ]);

        const requestsCount = requestsResult?.success ? (requestsResult?.count || 0) : 0;
        const messagesCount = chatsResult?.success
          ? (chatsResult.data || []).reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
          : 0;
        const notificationsCount = Number(
          notificationsResult?.count
          ?? notificationsResult?.unreadCount
          ?? notificationsResult?.data?.count
          ?? 0
        );

        setBadgeCounts({
          requests: requestsCount,
          messages: messagesCount,
          notifications: notificationsCount
        });
      } catch (error) {
        console.error('Error fetching navbar badge counts:', error);
      }
    };

    fetchBadgeCounts();
  }, [dashboardUserId, location.pathname]);

  const handleLogout = () => {
    // Add your logout logic here
    try {
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                <img src={logo} alt="Skill Swap" className="h-20 w-auto" />
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                const count =
                  item.name === 'Requests'
                    ? badgeCounts.requests
                    : item.name === 'Messages'
                      ? badgeCounts.messages
                      : item.name === 'Notifications'
                        ? badgeCounts.notifications
                        : 0;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <span className="relative mr-2">
                      <Icon className="w-5 h-5" />
                      {count > 0 && (
                        <span className="absolute -top-2 -right-2 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white leading-none">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{user?.fullname || user?.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogoutIcon className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <XIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const count =
                item.name === 'Requests'
                  ? badgeCounts.requests
                  : item.name === 'Messages'
                    ? badgeCounts.messages
                    : item.name === 'Notifications'
                      ? badgeCounts.notifications
                      : 0;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-base font-medium ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="relative mr-3">
                    <Icon className="w-5 h-5" />
                    {count > 0 && (
                      <span className="absolute -top-2 -right-2 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white leading-none">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="text-base font-medium text-gray-800">
                {user?.fullname || user?.name}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/update-profile"
                className="flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserIcon className="w-5 h-5 mr-3" />
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <LogoutIcon className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HeaderNavigation;
