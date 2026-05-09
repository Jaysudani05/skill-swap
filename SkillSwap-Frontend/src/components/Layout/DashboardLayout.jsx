// components/Layout/DashboardLayout.jsx
import React from "react";
import { useDashboard } from "../../context/DashboardContext";
import HeaderNavigation from "../Home/HeaderNavigation";
import LoadingSpinner from "../UI/LoadingSpinner";
import ErrorBoundary from "../UI/ErrorBoundary";

const DashboardLayout = ({ children, className = "" }) => {
  const { user, loading, error } = useDashboard();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <HeaderNavigation user={user} />
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default DashboardLayout;
