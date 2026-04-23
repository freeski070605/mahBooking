import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isReady, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="container py-12">
        <Skeleton className="h-80 w-full rounded-[2rem]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/account" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
