import { Mail, MapPin, User, Eye, HandHeart, ArrowRight, Star } from "lucide-react";
import React, { useMemo } from "react";

const MAX_DESCRIPTION_LENGTH = 100;
const MAX_SKILLS_DISPLAY = 3;

const ProfileCard = React.memo(({ profile, onViewProfile, onSendRequest }) => {
    const truncatedAbout = useMemo(() => {
        if (!profile.aboutMe) return 'No description available';
        return profile.aboutMe.length > MAX_DESCRIPTION_LENGTH
            ? `${profile.aboutMe.slice(0, MAX_DESCRIPTION_LENGTH)}...`
            : profile.aboutMe;
    }, [profile.aboutMe]);

    const displaySkillsOffered = useMemo(() => {
        if (!profile.skillsOffered || profile.skillsOffered.length === 0) return [];
        return profile.skillsOffered.slice(0, MAX_SKILLS_DISPLAY);
    }, [profile.skillsOffered]);

    const remainingOfferedCount = useMemo(() => {
        if (!profile.skillsOffered) return 0;
        return Math.max(0, profile.skillsOffered.length - MAX_SKILLS_DISPLAY);
    }, [profile.skillsOffered]);

    const displaySkillsToLearn = useMemo(() => {
        if (!profile.skillsToLearn || profile.skillsToLearn.length === 0) return [];
        return profile.skillsToLearn.slice(0, 2);
    }, [profile.skillsToLearn]);

    const remainingLearnCount = useMemo(() => {
        if (!profile.skillsToLearn) return 0;
        return Math.max(0, profile.skillsToLearn.length - 2);
    }, [profile.skillsToLearn]);

    const handleViewProfile = () => {
        if (onViewProfile) {
            onViewProfile(profile);
        }
    };

    const handleSendRequest = () => {
        if (onSendRequest) {
            onSendRequest(profile);
        }
    };

    return (
        <div className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-blue-200 overflow-hidden relative flex flex-col h-full">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-16 -mt-16 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

            {/* Profile Section */}
            <div className="relative z-10 text-center mb-6">
                {/* Avatar */}
                <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                    {profile.fullname || 'Unknown User'}
                </h3>

                {/* Headline */}
                {profile.headline && (
                    <p className="text-sm text-blue-600 font-medium mb-3 px-2">
                        {profile.headline}
                    </p>
                )}

                {/* Location */}
                {profile.location && (
                    <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{profile.location}</span>
                    </div>
                )}
            </div>

            {/* About Section */}
            <div className="relative z-10 mb-5">
                <p className="text-sm text-gray-600 leading-relaxed text-center px-1 line-clamp-3">
                    {truncatedAbout}
                </p>
            </div>

            {/* Skills Offered */}
            {displaySkillsOffered.length > 0 && (
                <div className="relative z-10 mb-3">
                    <p className="text-xs text-gray-400 text-center mb-1.5 font-medium uppercase tracking-wide">Offers</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {displaySkillsOffered.map((skill, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                            >
                                {skill}
                            </span>
                        ))}
                        {remainingOfferedCount > 0 && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                +{remainingOfferedCount} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Skills To Learn */}
            {displaySkillsToLearn.length > 0 && (
                <div className="relative z-10 mb-5">
                    <p className="text-xs text-gray-400 text-center mb-1.5 font-medium uppercase tracking-wide">Wants to learn</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {displaySkillsToLearn.map((skill, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100"
                            >
                                {skill}
                            </span>
                        ))}
                        {remainingLearnCount > 0 && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                +{remainingLearnCount} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Rating/Reviews (if available) */}
            {profile.rating && (
                <div className="relative z-10 mb-5 flex items-center justify-center text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{profile.rating}</span>
                    {profile.reviewCount && (
                        <span className="text-gray-500 ml-1">({profile.reviewCount})</span>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="relative z-10 space-y-2.5 mt-auto">
                <button
                    onClick={handleViewProfile}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-all duration-300 font-medium text-sm group/btn border border-gray-200 hover:border-gray-300"
                >
                    <Eye className="w-4 h-4" />
                    View Profile
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all duration-300" />
                </button>

                <button
                    onClick={handleSendRequest}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <HandHeart className="w-4 h-4" />
                    Start Skill Swap
                </button>
            </div>

            {/* Hover accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard;
