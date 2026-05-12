// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useDashboard } from "../context/DashboardContext";
import WelcomeBanner from "../components/Home/WelcomeBanner";
import QuickStats from "../components/Home/QuickStats";
import RecentActivity from "../components/Home/RecentActivity";
import UserProfileService from "../services/userProfile.service";
import { fetchUserInfo } from "../services/auth.service";
import ProfileCard from "../components/PublicProfile/ProfileCard";
import ProfileViewModal from "../components/PublicProfile/ProfileViewModal";
import SwapRequestModal from "../components/SwapRequestModal";
import SwapRequestsService from "../services/swapRequests.service";

const Dashboard = () => {
  const { user } = useDashboard();

  const [stats, setStats] = useState({
    connections: 0,
    profileViews: 0,
    messages: 0,
  });
  const [activities, setActivities] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedProfileForSwap, setSelectedProfileForSwap] = useState(null);
  const [isSwapRequestLoading, setIsSwapRequestLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1) Analytics (stats + activity)
        const analytics = await UserProfileService.getAnalytics();
        setStats(analytics.stats || stats);
        setActivities(analytics.activities || []);

        // 2) Simple recommended profiles: first few public profiles
        // (Dashboard shows a small curated strip, full list lives on Public Profiles page)
        const currentUser = await fetchUserInfo().catch(() => null);
        const currentUserId = currentUser?._id || currentUser?.id;

        const publicRes = await UserProfileService.getPublicProfiles(1, 6, "");
        const list = Array.isArray(publicRes.data) ? publicRes.data.filter(Boolean) : [];
        const filtered = currentUserId
          ? list.filter((p) => {
            const uid = p?.userId?._id || p?.userId?.id || p?.userId || p?._id || p?.id;
            return uid !== currentUserId;
          })
          : list;

        setRecommended(filtered.slice(0, 3));
      } catch (err) {
        const errMsg = err?.message || err?.error || JSON.stringify(err);
        setError(`Failed to load: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const result = await SwapRequestsService.getSwapRequests('all');
        if (result && result.success) {
          setRequests(result.data);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const handleViewProfile = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  const hasAlreadySentRequest = (profileId) => {
    return requests.some(request =>
      request.recipient?._id === profileId &&
      (request.status === 'pending' || request.status === 'accepted')
    );
  };

  const handleSendSkillSwapRequest = async (profile, message = "") => {
    const profileId = profile?.userId?._id || profile?.userId?.id || profile?.userId || profile?._id || profile?.id;
    if (!profileId || typeof profileId !== 'string') {
      alert('Unable to send request for this profile right now.');
      setShowSwapModal(false);
      setSelectedProfileForSwap(null);
      return;
    }
    if (hasAlreadySentRequest(profileId)) {
      alert('You have already sent a request to this user');
      setShowSwapModal(false);
      setSelectedProfileForSwap(null);
      return;
    }

    if (!message) {
      setSelectedProfileForSwap(profile);
      setShowSwapModal(true);
      return;
    }

    setIsSwapRequestLoading(true);
    try {
      const result = await SwapRequestsService.sendRequest(profileId, message);
      if (result.success) {
        const reqResult = await SwapRequestsService.getSwapRequests('all');
        if (reqResult && reqResult.success) {
          setRequests(reqResult.data);
        }
        setShowSwapModal(false);
        setSelectedProfileForSwap(null);
        alert('Skill swap request sent successfully!');
      } else {
        alert(result.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setIsSwapRequestLoading(false);
    }
  };

  const handleCloseSwapModal = () => {
    setShowSwapModal(false);
    setSelectedProfileForSwap(null);
    setIsSwapRequestLoading(false);
  };


  return (
    <DashboardLayout>
      <WelcomeBanner user={user} />

      {loading ? (
        <div className="mt-8 text-center text-slate-400">
          <div className="gradient-spinner mx-auto mb-4"></div>
          Loading your dashboard...
        </div>
      ) : error ? (
        <div className="mt-8 text-rose-400 glass-card p-6 text-center">{error}</div>
      ) : (
        <>
          {/* Top row: snapshot of your activity */}
          <QuickStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recommended connections preview */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Recommended Connections
                </h2>
                <a
                  href="/public-profiles"
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                >
                  View all
                </a>
              </div>

              {recommended.length === 0 ? (
                <div className="glass-card p-6">
                  <p className="text-sm text-slate-400">
                    No recommended profiles yet. Try updating your skills and interests to get better matches.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recommended.map((profile) => {
                    const recipientId = profile?.userId?._id || profile?.userId?.id || profile?.userId || profile?._id || profile?.id;
                    return (
                    <ProfileCard
                      key={profile?._id || profile?.id}
                      profile={profile}
                      onViewProfile={handleViewProfile}
                      onSendRequest={(p) => handleSendSkillSwapRequest(p)}
                      hasAlreadySent={hasAlreadySentRequest(recipientId)}
                    />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent activity snapshot */}
            <section>
              <RecentActivity activities={activities.slice(0, 5)} />
            </section>
          </div>
        </>
      )}

      {/* Profile View Modal */}
      <ProfileViewModal
        profile={selectedProfile}
        isOpen={showProfileModal}
        onClose={handleCloseProfileModal}
      />

      {/* Swap Request Modal */}
      <SwapRequestModal
        profile={selectedProfileForSwap}
        isOpen={showSwapModal}
        onClose={handleCloseSwapModal}
        onConfirm={(message) => handleSendSkillSwapRequest(selectedProfileForSwap, message)}
        isLoading={isSwapRequestLoading}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
