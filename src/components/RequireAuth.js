// import React from 'react';
// import { Navigate } from 'react-router-dom';

// function RequireAuth({ children }) {
//   const isAuthenticated = !!localStorage.getItem('access');
//   console.log("Auth token:", localStorage.getItem('access'));
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }

// export default RequireAuth;

import { Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('access');
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
