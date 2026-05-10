import React, { useEffect, useState, useCallback } from 'react';
import { Search, User, MapPin, Mail, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import UserProfileService from "../services/userProfile.service";
import SwapRequestsService from '../services/swapRequests.service';
import { matchSkills } from "../services/ai.service";

// Component imports
import ProfileCard from './PublicProfile/ProfileCard';
import ProfileCardSkeleton from './PublicProfile/ProfileCardSkeleton';
import Pagination from './PublicProfile/Pagination';
import ProfileViewModal from './PublicProfile/ProfileViewModal';
import SwapRequestModal from './SwapRequestModal';
import { fetchUserInfo } from '../services/auth.service';

// Constants
const PROFILES_PER_PAGE = 6;
const SEARCH_DEBOUNCE_DELAY = 500;
const MAX_DESCRIPTION_LENGTH = 120;

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Set display names
ProfileCard.displayName = 'ProfileCard';

// Error Notification Component
const ErrorNotification = ({ message, onClose, isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 min-w-80">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-red-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

// Success Notification Component
const SuccessNotification = ({ message, onClose, isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 min-w-80">
      <div className="w-5 h-5 flex-shrink-0 rounded-full bg-white text-green-500 flex items-center justify-center text-sm font-bold">
        ✓
      </div>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-green-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

// Error Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

// Empty State Component
const EmptyState = ({ searchTerm }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
      <Search className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {searchTerm ? 'No profiles found' : 'No profiles available'}
    </h3>
    <p className="text-gray-600">
      {searchTerm
        ? `We couldn't find any profiles matching "${searchTerm}". Try adjusting your search terms.`
        : 'There are no public profiles to display at the moment.'
      }
    </p>
  </div>
);

// Main Component
const PublicProfiles = () => {
  // Existing state
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // AI matching state
  const [aiActive, setAiActive] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  // New state for swap modal
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedProfileForSwap, setSelectedProfileForSwap] = useState(null);
  const [isSwapRequestLoading, setIsSwapRequestLoading] = useState(false);

  // Notification state
  const [errorNotification, setErrorNotification] = useState({ show: false, message: '' });
  const [successNotification, setSuccessNotification] = useState({ show: false, message: '' });

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // Add this useEffect to fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await fetchUserInfo();
        if (!currentUser) return;

        const id = currentUser._id || currentUser.id;
        setCurrentUserId(id);

        // Fetch full profile for AI matching context
        const profile = await UserProfileService.getProfileByUserId(id);
        setCurrentUserProfile(profile);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);
  // Notification handlers
  const showErrorNotification = useCallback((message) => {
    setErrorNotification({ show: true, message });
  }, []);

  const hideErrorNotification = useCallback(() => {
    setErrorNotification({ show: false, message: '' });
  }, []);

  const showSuccessNotification = useCallback((message) => {
    setSuccessNotification({ show: true, message });
  }, []);

  const hideSuccessNotification = useCallback(() => {
    setSuccessNotification({ show: false, message: '' });
  }, []);

  // Check if user already sent request to this profile
  const hasAlreadySentRequest = useCallback((profileId) => {
    return requests.some(request =>
      request.recipient._id === profileId &&
      (request.status === 'pending' || request.status === 'accepted')
    );
  }, [requests]);

  // Fetch profiles function
  const fetchProfiles = useCallback(async (currentPage, currentSearch) => {
    try {

      // Remove the fallback logic entirely
      const isNewSearch = currentSearch !== debouncedSearch;

      if (isNewSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const response = await UserProfileService.getPublicProfiles(
        currentPage,
        PROFILES_PER_PAGE,
        currentSearch,
        currentUserId
      );

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }

      // Filter out current user's profile (frontend fallback, mostly handled by backend now)
      const filteredProfiles = Array.isArray(response.data)
        ? response.data.filter(profile => {
          const profileUserId = profile.userId?._id || profile.userId;
          const profileId = profile._id;
          return profileUserId !== currentUserId && profileId !== currentUserId;
        })
        : [];

      setProfiles(filteredProfiles);
      setPagination(response.pagination || {});

    } catch (err) {
      console.error('Error fetching public profiles:', err);
      setError(err.message || 'Failed to load profiles. Please try again.');
      setProfiles([]);
      setPagination({});
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearch, currentUserId]); // Keep only debouncedSearch for the comparison


  // Fetch swap requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await SwapRequestsService.getSwapRequests('all');
      console.log(result);

      if (result.success) {
        setRequests(result.data);
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle skill swap request with duplicate check
  const handleSendSkillSwapRequest = useCallback(async (profile, message = "Hi! I'd like to connect for a skill swap.") => {
    // Check if user already sent a request to this profile
    if (hasAlreadySentRequest(profile.userId._id)) {
      showErrorNotification('You have already sent a request to this user');
      setShowSwapModal(false);
      setSelectedProfileForSwap(null);
      return;
    }

    if (!message) {
      // If no message provided, open the modal
      setSelectedProfileForSwap(profile);
      setShowSwapModal(true);
      return;
    }

    // If message is provided (from modal), send the request
    setIsSwapRequestLoading(true);
    try {
      const result = await SwapRequestsService.sendRequest(profile.userId._id, message);
      console.log(profile, message);

      if (result.success) {
        await fetchRequests(); // Refresh the list
        setShowSwapModal(false); // Close modal on success
        setSelectedProfileForSwap(null);
        showSuccessNotification('Skill swap request sent successfully!');
      } else {
        // Handle different error types
        let errorMessage = result.error || 'Failed to send request';

        // Check for specific error types
        if (result.error?.includes('already sent') || result.error?.includes('duplicate')) {
          errorMessage = 'You have already sent a request to this user';
        } else if (result.error?.includes('cannot send request to yourself')) {
          errorMessage = 'You cannot send a request to yourself';
        } else if (result.error?.includes('user not found')) {
          errorMessage = 'User not found';
        }

        showErrorNotification(errorMessage);
        console.error('Error sending request:', result.error);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      showErrorNotification('Failed to send request. Please try again.');
    } finally {
      setIsSwapRequestLoading(false);
    }
  }, [fetchRequests, hasAlreadySentRequest, showErrorNotification, showSuccessNotification]);

  // Handle closing swap modal
  const handleCloseSwapModal = useCallback(() => {
    setShowSwapModal(false);
    setSelectedProfileForSwap(null);
    setIsSwapRequestLoading(false);
  }, []);

  // Effects
  useEffect(() => {
    if (debouncedSearch !== search) {
      setPage(1); // Reset to first page on new search
    }
  }, [debouncedSearch, search]);

  useEffect(() => {
    fetchProfiles(page, debouncedSearch);
  }, [fetchProfiles, page, debouncedSearch]);

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Other handlers
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !isLoading) {
      setPage(newPage);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.totalPages, isLoading]);

  const handleRetry = useCallback(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleViewProfile = useCallback((profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  }, []);

  const handleCloseProfileModal = useCallback(() => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  }, []);

  // AI Skill Match handler
  const handleAiMatch = useCallback(async () => {
    try {
      setAiMessage("");
      setAiActive(true);

      if (!currentUserProfile) {
        setAiMessage("Please complete your profile first so we can find the best matches for you.");
        return;
      }

      setAiLoading(true);

      // Backend fetches ALL profiles from the database — we just specify how many results
      const result = await matchSkills({ top_k: 6 });

      if (!result.matches || !result.matches.length) {
        setAiMessage("No matching profiles found for your skills.");
        return;
      }

      // Fetch full profile data for each matched user (they may not be on the current page)
      const rankedProfiles = [];
      for (const match of result.matches) {
        try {
          const response = await UserProfileService.getProfileByUserId(match.user_id || match.userId);
          const profile = response?.data || response;
          if (profile && profile.fullname) {
            rankedProfiles.push({
              ...profile,
              aiScore: match.score,
              aiReasons: match.reasons || [],
              aiMatchedSkills: match.matchedSkills || {},
            });
          }
        } catch {
          // Profile may have been deleted; skip it
        }
      }

      if (!rankedProfiles.length) {
        setAiMessage("No matching profiles found for your skills.");
        return;
      }

      setProfiles(rankedProfiles);
      setAiMessage(`Found ${rankedProfiles.length} best match${rankedProfiles.length > 1 ? "es" : ""} across all users.`);
    } catch (err) {
      console.error("AI Skill Match error:", err);
      const msg = err.response?.data?.message || err.response?.data?.details;
      const isUnavailable =
        err.response?.status === 503 ||
        msg?.includes("starting up") ||
        msg?.includes("unavailable") ||
        err.code === "ECONNABORTED";
      setAiMessage(
        isUnavailable
          ? "AI service is starting up. Please wait 30–60 seconds and try again."
          : msg || "Unable to run AI skill matching right now. Please try again later."
      );
    } finally {
      setAiLoading(false);
    }
  }, [currentUserProfile]);

  // Computed values
  const isFirstLoad = isLoading && profiles.length === 0 && !error;
  const showSkeletons = isFirstLoad;
  const showProfiles = !isLoading && !error && profiles.length > 0;
  const showEmpty = !isLoading && !error && profiles.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + AI Match */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, headline, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAiMatch}
            disabled={aiLoading || isLoading}
            className="inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running AI Skill Match...
              </>
            ) : (
              "AI Skill Match"
            )}
          </button>
        </div>

        {aiActive && aiMessage && (
          <div className="mb-4 rounded-lg bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-800">
            {aiMessage}
          </div>
        )}

        {/* Content */}
        {error ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : showEmpty ? (
          <EmptyState searchTerm={debouncedSearch} />
        ) : (
          <>
            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {showSkeletons
                ? Array.from({ length: PROFILES_PER_PAGE }).map((_, index) => (
                  <ProfileCardSkeleton key={index} />
                ))
                : showProfiles &&
                profiles.map((profile) => (
                  <ProfileCard
                    key={profile._id}
                    profile={profile}
                    onViewProfile={handleViewProfile}
                    onSendRequest={(profile) => handleSendSkillSwapRequest(profile)}
                    hasAlreadySent={hasAlreadySentRequest(profile._id)}
                  />
                ))
              }
            </div>

            {/* Pagination */}
            {(showProfiles || isLoading) && (
              <Pagination
                pagination={pagination}
                currentPage={page}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>

      {/* Profile View Modal */}
      <ProfileViewModal
        profile={selectedProfile}
        isOpen={showProfileModal}
        onClose={handleCloseProfileModal}
        onConnect={(profile) => {
          handleCloseProfileModal();
          setSelectedProfileForSwap(profile);
          setShowSwapModal(true);
        }}
      />

      {/* Swap Request Modal */}
      <SwapRequestModal
        profile={selectedProfileForSwap}
        isOpen={showSwapModal}
        onClose={handleCloseSwapModal}
        onConfirm={(message) => handleSendSkillSwapRequest(selectedProfileForSwap, message)}
        isLoading={isSwapRequestLoading}
      />

      {/* Error Notification */}
      <ErrorNotification
        message={errorNotification.message}
        isVisible={errorNotification.show}
        onClose={hideErrorNotification}
      />

      {/* Success Notification */}
      <SuccessNotification
        message={successNotification.message}
        isVisible={successNotification.show}
        onClose={hideSuccessNotification}
      />
    </div>
  );
};

export default PublicProfiles;
