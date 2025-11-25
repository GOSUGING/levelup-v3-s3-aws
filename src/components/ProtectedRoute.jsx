import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Uso:
 * <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    // si no hay usuario, redirige a login
    return <Navigate to="/login" replace />;
  }
  return children;
}
