import {
  Search,
  ChevronRight,
  MessageSquare,
  BarChart2,
  GitPullRequest
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Quick Actions Component
const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Search,
      title: "Find People",
      description: "Discover and connect with professionals",
      color: "blue",
      href: "/public-profiles"
    },
    {
      icon: GitPullRequest,
      title: "Swap Requests",
      description: "Manage your skill connection requests",
      color: "green",
      href: "/requests"
    },
    {
      icon: MessageSquare,
      title: "Messages",
      description: "Chat with your connections",
      color: "purple",
      href: "/chat"
    },
    {
      icon: BarChart2,
      title: "Platform Stats",
      description: "View community insights and statistics",
      color: "yellow",
      href: "/stats"
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-white/90 text-blue-700 border-blue-200/70 hover:border-blue-300 hover:shadow-blue-100/80",
      green: "bg-white/90 text-green-700 border-green-200/70 hover:border-green-300 hover:shadow-green-100/80",
      purple: "bg-white/90 text-purple-700 border-purple-200/70 hover:border-purple-300 hover:shadow-purple-100/80",
      yellow: "bg-white/90 text-amber-700 border-amber-200/70 hover:border-amber-300 hover:shadow-amber-100/80"
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="mb-10 rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-5 shadow-sm md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${getColorClasses(action.color)}`}
            onClick={() => {
              navigate(action.href);
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
            <div className="relative z-10">
              <div className="mb-3 inline-flex rounded-lg bg-white/80 p-2 shadow-sm ring-1 ring-black/5">
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-semibold">{action.title}</h3>
              <p className="text-sm opacity-80">{action.description}</p>
              <ChevronRight className="mt-3 h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
