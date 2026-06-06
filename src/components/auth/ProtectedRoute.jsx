import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../config/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#0a0a0a',
        color: 'var(--gold)'
      }}>
        <div className="animate-pulse">Initializing Neural Link...</div>
      </div>
    );
  }

  // if (!user) {
  //   // Redirect to landing page if not authenticated
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default ProtectedRoute;
