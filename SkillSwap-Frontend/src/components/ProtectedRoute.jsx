import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../APIs/api';

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Backend exposes /api/auth/me for auth check
        await API.get('/auth/me');
        setIsAuth(true);
      } catch (err) {
        console.log(err);
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;