import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role, initializing } = useAuth();

  if (initializing) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-600">Opening the reading room…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Restricted section</h3>
          <p className="text-gray-500">Your role ({role}) doesn't have access to this page.</p>
        </div>
      </div>
    );
  }

  return children;
}