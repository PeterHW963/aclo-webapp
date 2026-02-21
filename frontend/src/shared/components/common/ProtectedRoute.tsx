import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAppSelector } from "../../../app/hooks";
import type { User } from "../../../shared/types/user";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: User["role"];
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user || (role && user.role !== role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
