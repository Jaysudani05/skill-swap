import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import {
    UserIcon,
    LocationMarkerIcon,
    MailIcon,
    PhoneIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    ClockIcon,
    CurrencyDollarIcon,
    PencilIcon,
    EyeIcon,
    EyeOffIcon
} from '@heroicons/react/outline';

const Profile = () => {
    const { user } = useDashboard();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        console.log(user);
    }, []);

    const handleEditProfile = () => {
        navigate('/update-profile');
    };

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0 mb-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                                {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 break-words">
                                    {user.fullname || 'No name provided'}
                                </h1>
                                <p className="text-base sm:text-lg text-gray-600 mt-1 break-words">
                                    {user.headline || 'No headline provided'}
                                </p>
                                <div className="flex items-center justify-center sm:justify-start mt-2">
                                    <LocationMarkerIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <span className="text-gray-600 text-sm sm:text-base break-words">
                                        {user.location || 'Location not specified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center">
                                {user.isProfilePublic ? (
                                    <>
                                        <EyeIcon className="h-4 w-4 text-green-500 mr-2" />
                                        <span className="text-green-600 text-sm sm:text-base">Public</span>
                                    </>
                                ) : (
                                    <>
                                        <EyeOffIcon className="h-4 w-4 text-red-500 mr-2" />
                                        <span className="text-red-600 text-sm sm:text-base">Private</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleEditProfile}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Time Credits */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="flex items-center justify-center sm:justify-start">
                            <CurrencyDollarIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                            <span className="font-semibold text-yellow-800 text-sm sm:text-base">
                                Time Credits: {user.timeCredits || 0}
                            </span>
                        </div>
                    </div>

                    {/* About Me */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center sm:text-left">
                            About Me
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base text-center sm:text-left break-words">
                            {user.aboutMe || 'No description provided yet.'}
                        </p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0">
                            <MailIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-800 text-sm sm:text-base break-all">
                                    {user.publicEmail || 'Not provided'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0">
                            <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-gray-800 text-sm sm:text-base">
                                    {user.phone || 'Not provided'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0 sm:col-span-2">
                            <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                            </svg>
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-gray-500">LinkedIn</p>
                                {user.linkedinUrl ? (
                                    <a
                                        href={user.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm sm:text-base break-all"
                                    >
                                        {user.linkedinUrl}
                                    </a>
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">Not provided</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Offered Section */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
                        Skills Offered
                    </h2>
                    {user.skillsOffered && user.skillsOffered.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {user.skillsOffered.map((skill, idx) => (
                                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center sm:text-left text-sm sm:text-base">
                            No skills offered yet.
                        </p>
                    )}
                </div>

                {/* Skills To Learn Section */}
                {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
                            Skills to Learn
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {user.skillsToLearn.map((skill, idx) => (
                                <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience Section */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center sm:justify-start">
                        <BriefcaseIcon className="h-5 w-5 mr-2" />
                        Experience
                    </h2>
                    {user.experience && user.experience.length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                            {user.experience.map((exp, index) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4 sm:pl-6 py-2">
                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                                        {exp.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm sm:text-base break-words">
                                        {exp.company}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        {exp.duration}
                                    </p>
                                    {exp.description && (
                                        <p className="text-gray-600 mt-2 text-sm sm:text-base break-words leading-relaxed">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center sm:text-left text-sm sm:text-base">
                            No experience added yet.
                        </p>
                    )}
                </div>

                {/* Education Section */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center sm:justify-start">
                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                        Education
                    </h2>
                    {user.education && user.education.length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                            {user.education.map((edu, index) => (
                                <div key={index} className="border-l-4 border-green-500 pl-4 sm:pl-6 py-2">
                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                                        {edu.degree}
                                    </h3>
                                    <p className="text-gray-600 text-sm sm:text-base break-words">
                                        {edu.institution}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        {edu.year}
                                    </p>
                                    {edu.description && (
                                        <p className="text-gray-600 mt-2 text-sm sm:text-base break-words leading-relaxed">
                                            {edu.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center sm:text-left text-sm sm:text-base">
                            No education added yet.
                        </p>
                    )}
                </div>

                {/* Availability Section */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center sm:justify-start">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Availability
                    </h2>
                    {user.availability && user.availability.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            {user.availability.map((day, index) => (
                                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                                    <p className="font-medium text-gray-800 text-sm sm:text-base break-words">
                                        {day}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center sm:text-left text-sm sm:text-base">
                            No availability set yet.
                        </p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Profile
