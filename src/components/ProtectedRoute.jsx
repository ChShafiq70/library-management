import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf6f0]">
        <div className="flex flex-col items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a97e] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c9a97e]"></span>
          </span>
          <p className="text-sm tracking-widest lowercase text-[#8a7a68]">
            opening the reading room…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf6f0] px-6">
        <div className="text-center bg-white/70 border border-[#e8ddc f]/60 rounded-3xl px-10 py-12 shadow-sm max-w-sm">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-[#f1e3d3] flex items-center justify-center">
            <span className="text-[#c9a97e] text-lg">✦</span>
          </div>
          <h3 className="text-base font-medium lowercase tracking-wide text-[#5c4f3f] mb-2">
            restricted section
          </h3>
          <p className="text-sm text-[#a89a86] lowercase">
            your role ({role}) doesn't have access to this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}