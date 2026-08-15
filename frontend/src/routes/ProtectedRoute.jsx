import React, { useContext } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const {
    user,
    isAuthenticated,
  } = useContext(AuthContext);

  const location = useLocation();

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // Role not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/403"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;