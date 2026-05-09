// pages/Actions.jsx
import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import QuickActions from "../components/Home/QuickActions";

const Actions = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quick Actions</h1>
        <p className="text-gray-600">Manage your profile and platform activities</p>
      </div>
      <QuickActions />
    </DashboardLayout>
  );
};

export default Actions;
