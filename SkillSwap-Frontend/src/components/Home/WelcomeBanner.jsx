import { User } from "lucide-react";

// Welcome Banner Component
const WelcomeBanner = ({ user }) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {greeting}, {user?.fullname || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-blue-100">
            Welcome back to your professional network. What would you like to accomplish today?
          </p>
        </div>
        <div className="hidden md:block">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;