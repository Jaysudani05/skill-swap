// pages/PublicProfiles.jsx
import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import PublicProfiles from "../components/PublicProfiles";

const PublicProfilesPage = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Public Profiles</h1>
        <p className="text-gray-600">Discover and connect with professionals in your network</p>
      </div>
      
      <PublicProfiles />
    </DashboardLayout>
  );
};

export default PublicProfilesPage;
