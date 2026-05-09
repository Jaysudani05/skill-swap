import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, User, MapPin, Star, HandHeart } from 'lucide-react';

const SwapRequestModal = ({ profile, isOpen, onClose, onConfirm, isLoading }) => {
  const [message, setMessage] = useState("Hi! I'd like to connect for a skill swap.");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onConfirm(message.trim());
    }
  };

  const handleClose = () => {
    setMessage("Hi! I'd like to connect for a skill swap.");
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100/80 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation
      >
        {/* Subtle blurred background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-blue-50/10 backdrop-blur-3xl"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-100/10 rounded-full blur-xl -ml-8 -mb-8"></div>

        {/* Header - Compact */}
        <div className="relative z-10 p-5 pb-3 text-center border-b border-gray-100/50">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
            <HandHeart className="w-5 h-5 text-blue-600" />
          </div>
          
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 mb-1">Skill Swap Request</h2>
          <p className="text-sm text-blue-600 font-medium">Connect and grow together</p>
        </div>

        <div className="relative z-10 p-5">
          {/* Compact Profile Section */}
          <div className="mb-4 p-3 bg-gray-50/60 backdrop-blur-sm rounded-xl border border-gray-200/40 relative">
            <div className="text-center">
              {/* Compact Avatar */}
              <div className="w-10 h-10 mx-auto mb-2 relative">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile.fullname} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white shadow-sm"></div>
              </div>

              {/* Compact Name & Info */}
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                {profile.fullname || 'Unknown User'}
              </h3>

              {profile.headline && (
                <p className="text-xs text-blue-600 font-medium mb-2 px-1">
                  {profile.headline}
                </p>
              )}

              {profile.location && (
                <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{profile.location}</span>
                </div>
              )}

              {/* Compact Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1">
                  {profile.skills.slice(0, 2).map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                      +{profile.skills.length - 2}
                    </span>
                  )}
                </div>
              )}

              {profile.rating && (
                <div className="mt-2 flex items-center justify-center text-xs text-gray-600">
                  <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{profile.rating}</span>
                  {profile.reviewCount && (
                    <span className="text-gray-500 ml-1">({profile.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Compact Message Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="message" className="text-sm font-semibold text-gray-900">
                  Your Message
                </label>
                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-medium">
                  Optional
                </span>
              </div>
              
              <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'd love to connect and explore a skill swap..."
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none transition-all duration-200 text-sm placeholder-gray-400 bg-white/80 backdrop-blur-sm"
                  disabled={isLoading}
                />
                <div className="absolute bottom-1.5 right-2 text-xs text-gray-400">
                  {message.length}/500
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-blue-50/60 backdrop-blur-sm rounded-lg border border-blue-100/50">
                <p className="text-xs text-blue-700">
                  <strong>💡 Tip:</strong> Mention skills you'd like to exchange
                </p>
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all duration-200 font-medium text-sm border border-gray-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Compact Footer */}
        <div className="relative z-10 px-5 pb-4 text-center">
          <p className="text-xs text-gray-500">
            Request will be sent to <span className="font-medium text-gray-700">{profile.fullname}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestModal;
