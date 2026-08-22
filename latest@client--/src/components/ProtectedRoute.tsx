import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface Props {
  roles?: (
    | "STUDENT"
    | "TEACHER"
    | "ADMIN"
  )[];
}

export default function ProtectedRoute({
  roles,
}: Props) {
  const {
    user,
    loading,
  } = useAuth();

  /* =========================================
     AUTH LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================
     NOT LOGGED IN
  ========================================= */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =========================================
     ROLE CHECK
  ========================================= */

  if (
    roles &&
    !roles.includes(user.role)
  ) {
    switch (user.role) {
      case "STUDENT":
        return (
          <Navigate
            to="/student/dashboard"
            replace
          />
        );

      case "TEACHER":
        return (
          <Navigate
            to="/teacher"
            replace
          />
        );

      case "ADMIN":
        return (
          <Navigate
            to="/admin"
            replace
          />
        );

      default:
        return (
          <Navigate
            to="/login"
            replace
          />
        );
    }
  }

  return <Outlet />;
}