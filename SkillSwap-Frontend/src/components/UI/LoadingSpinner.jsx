// components/UI/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
