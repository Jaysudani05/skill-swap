import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { logout, user } = useAuth();

  const handleClick = async () => {
    try {
      await logout();
    } catch (err) {
      setError(err.response?.data?.message || "Logout failed");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-start space-y-2">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md shadow transition duration-200"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Logout;
