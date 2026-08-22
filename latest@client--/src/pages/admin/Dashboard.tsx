import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Statistics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalQuizzes: number;
}

interface DashboardData {
  statistics: Statistics;
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/admin/dashboard");

        setDashboard(
          response.data.data
        );
      } catch (error: any) {
        console.error(
          "Admin dashboard error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================
     LOADING
  ========================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-slate-500">
            Loading admin dashboard...
          </p>

        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================== */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <h2 className="text-lg font-bold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-red-600">
            {error}
          </p>

        </div>

      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            No dashboard data
          </h2>

        </div>

      </div>
    );
  }

  const stats =
    dashboard.statistics;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* =========================
          HEADER
      ========================== */}

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Welcome back,{" "}
          {user?.name || "Admin"}! 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor and manage your AI Learning Tutor system.
        </p>

      </div>

      {/* =========================
          USER STATISTICS
      ========================== */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered users"
          icon="👥"
        />

        <StatCard
          title="Students"
          value={stats.totalStudents}
          description="Student accounts"
          icon="🎓"
        />

        <StatCard
          title="Teachers"
          value={stats.totalTeachers}
          description="Teacher accounts"
          icon="👨‍🏫"
        />

        <StatCard
          title="Admins"
          value={stats.totalAdmins}
          description="Administrator accounts"
          icon="🛡️"
        />

      </div>

      {/* =========================
          LEARNING STATISTICS
      ========================== */}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Courses"
          value={stats.totalCourses}
          description="Available courses"
          icon="📚"
        />

        <StatCard
          title="Enrollments"
          value={stats.totalEnrollments}
          description="Course enrollments"
          icon="📝"
        />

        <StatCard
          title="Lessons"
          value={stats.totalLessons}
          description="Learning lessons"
          icon="📖"
        />

        <StatCard
          title="Quizzes"
          value={stats.totalQuizzes}
          description="Available quizzes"
          icon="🧠"
        />

      </div>

      {/* =========================
          SYSTEM OVERVIEW
      ========================== */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* USERS OVERVIEW */}

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Users Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Distribution of system users.
              </p>

            </div>

            <span className="text-3xl">
              👥
            </span>

          </div>

          <div className="mt-6 space-y-5">

            <RoleProgress
              label="Students"
              value={stats.totalStudents}
              total={stats.totalUsers}
            />

            <RoleProgress
              label="Teachers"
              value={stats.totalTeachers}
              total={stats.totalUsers}
            />

            <RoleProgress
              label="Admins"
              value={stats.totalAdmins}
              total={stats.totalUsers}
            />

          </div>

        </div>

        {/* LEARNING OVERVIEW */}

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Learning Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current learning content.
              </p>

            </div>

            <span className="text-3xl">
              📚
            </span>

          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <OverviewItem
              label="Courses"
              value={stats.totalCourses}
              icon="📚"
            />

            <OverviewItem
              label="Enrollments"
              value={stats.totalEnrollments}
              icon="📝"
            />

            <OverviewItem
              label="Lessons"
              value={stats.totalLessons}
              icon="📖"
            />

            <OverviewItem
              label="Quizzes"
              value={stats.totalQuizzes}
              icon="🧠"
            />

          </div>

        </div>

      </div>

      {/* =========================
          ADMIN ACTIONS
      ========================== */}

      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              System Management
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Manage users, roles, courses, and system settings.
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Manage Users
            </button>

            <button
              type="button"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Manage Courses
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <span className="text-2xl">
          {icon}
        </span>

      </div>

      <h2 className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* =========================
   ROLE PROGRESS
========================= */

function RoleProgress({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round(
          (value / total) * 100
        );

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="text-sm font-semibold text-slate-500">
          {value} ({percentage}%)
        </span>

      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================
   OVERVIEW ITEM
========================= */

function OverviewItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-500">
          {label}
        </p>

        <span>
          {icon}
        </span>

      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}