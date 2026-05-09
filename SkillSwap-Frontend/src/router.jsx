import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";
import NeedHelp from "./pages/NeedHelp";
import Dashboard from "./pages/Dashboard";
import UpdateUser from "./components/UpdateUserInfo/UpdateUser";
import Stats from "./pages/Stats";
import Actions from "./pages/Actions";
import Notifications from "./pages/Notifications";
import PublicProfilesPage from "./pages/PublicProfiles";
import { DashboardProvider } from "./context/DashboardContext";
import Profile from "./pages/Profile";
import Requests from "./components/Requests/Requests";
import ChatPage from "./pages/Chat";

const DashboardRoutes = () => (
  <DashboardProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/update-profile" element={<UpdateUser />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/actions" element={<Actions />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/public-profiles" element={<PublicProfilesPage />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  </DashboardProvider>
);

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/help" element={<NeedHelp />} />
      <Route path="/user-profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/*" element={
        <ProtectedRoute>
          <DashboardRoutes />
        </ProtectedRoute>
      } /> 
    </Routes>
  );
};

export default AppRouter;
