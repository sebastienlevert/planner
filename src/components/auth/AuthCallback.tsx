import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // AuthContext handles all the redirect logic now
    // This component just redirects to settings after a brief delay
    console.log('AuthCallback: Mounted, will redirect to settings...');

    const timer = setTimeout(() => {
      console.log('AuthCallback: Redirecting to settings');
      navigate('/settings', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};
