import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Preloader from './Preloader';

const PrivateRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Preloader />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;