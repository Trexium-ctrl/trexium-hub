import { Outlet, Navigate } from 'react-router-dom';

export default function ProtectedRoute({ unauthenticatedElement }) {
  const authed = localStorage.getItem("trexium_auth") === "true";
  if (!authed) {
    return unauthenticatedElement || <Navigate to="/login" replace />;
  }
  return <Outlet />;
}