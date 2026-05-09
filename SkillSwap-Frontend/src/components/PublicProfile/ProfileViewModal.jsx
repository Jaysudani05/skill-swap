import React, { useEffect, useCallback } from 'react';
import { X, MapPin, Mail, User, Calendar, Briefcase, Globe, Phone, Award, GraduationCap, BookOpen } from 'lucide-react';

const ProfileViewModal = ({ profile, isOpen, onClose }) => {
  const handleEscKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscKey]);

  if (!isOpen || !profile) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Professional Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <div className="p-6">

            {/* Profile Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-1 break-words">
                  {profile.fullname || 'Unknown User'}
                </h1>
                {profile.headline && (
                  <p className="text-gray-600 mb-3 break-words">{profile.headline}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="break-words">{profile.location}</span>
                    </div>
                  )}
                  {profile.userId?.email && (
                    <div className="flex items-center text-green-600">
                      <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                      Available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">

                {/* About - Fixed overflow */}
                {profile.aboutMe && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed text-sm break-words whitespace-pre-wrap">
                        {profile.aboutMe}
                      </p>
                    </div>
                  </div>
                )}

                {/* Experience */}
                {profile.experience && profile.experience.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
                    <div className="space-y-3">
                      {profile.experience.map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0 mr-3">
                              <h4 className="font-medium text-gray-900 break-words">{exp.title}</h4>
                              <p className="text-blue-600 text-sm font-medium break-words">{exp.company}</p>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center flex-shrink-0">
                              <Calendar className="w-3 h-3 mr-1" />
                              {exp.duration}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section - Added */}
                {profile.education && profile.education.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Education
                    </h3>
                    <div className="space-y-3">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0 mr-3">
                              <h4 className="font-medium text-gray-900 break-words">{edu.degree || edu.qualification}</h4>
                              <p className="text-blue-600 text-sm font-medium break-words">{edu.institution || edu.school}</p>
                              {edu.field && (
                                <p className="text-gray-600 text-sm break-words">{edu.field}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center flex-shrink-0">
                              <Calendar className="w-3 h-3 mr-1" />
                              {edu.duration || edu.year}
                            </span>
                          </div>
                          {edu.description && (
                            <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">

                {/* Skills I Offer */}
                {profile.skillsOffered && profile.skillsOffered.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Award className="w-4 h-4 mr-2 text-green-600" />
                      Skills I Offer
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsOffered.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills I Want to Learn */}
                {profile.skillsToLearn && profile.skillsToLearn.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                      Skills I Want to Learn
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsToLearn.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </h3>
                  <div className="space-y-3">
                    {profile.userId?.email && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <Mail className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                          <p className="text-sm font-medium text-gray-900 break-all">{profile.userId.email}</p>
                        </div>
                      </div>
                    )}

                    {profile.phone && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                          <p className="text-sm font-medium text-gray-900 break-words">{profile.phone}</p>
                        </div>
                      </div>
                    )}

                    {profile.website && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <Globe className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Website</p>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-purple-600 hover:text-purple-800 break-all"
                          >
                            Visit Site
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Connect
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewModal;
