import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import{
  useNavigate,
} from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  TrendingUp,
  ArrowRight,
  MoreVertical,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

interface Course {
  enrollmentId: number;

  course: {
    id: number;
    title: string;
    description: string | null;
  };

  enrolledAt: string;

  progress: CourseProgress;
}

interface DashboardStatistics {
  totalCourses: number;
  completedCourses: number;
  averageProgress: number;
}

interface DashboardStudent {
  id: number;
  name: string;
  email: string;
  role: "STUDENT";
}

interface DashboardData {
  student: DashboardStudent;
  statistics: DashboardStatistics;
  courses: Course[];
}

interface DashboardResponse {
  success?: boolean;
  message?: string;
  data: DashboardData;
}

/* =====================================================
   HELPERS
===================================================== */

function normalizePercentage(value: number | null | undefined) {
  const percentage = Number(value ?? 0);

  if (Number.isNaN(percentage)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(percentage)));
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    return (
      response?.data?.message ||
      "Failed to load dashboard."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load dashboard.";
}

/* =====================================================
   MAIN DASHBOARD
===================================================== */

export default function StudentDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<DashboardResponse>(
          "/student/dashboard"
        );

      if (!response.data?.data) {
        throw new Error(
          "Dashboard data was not returned by the server."
        );
      }

      setDashboard(response.data.data);
    } catch (error: unknown) {
      console.error(
        "Student dashboard error:",
        error
      );

      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return <DashboardLoading />;
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={loadDashboard}
      />
    );
  }

  /* =====================================================
     NO DATA
  ===================================================== */

  if (!dashboard) {
    return <NoDashboardData />;
  }

  const statistics = dashboard.statistics;

  const courses = Array.isArray(
    dashboard.courses
  )
    ? dashboard.courses
    : [];

  const averageProgress =
    normalizePercentage(
      statistics.averageProgress
    );

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-full space-y-6">

      {/* =================================================
          WELCOME
      ================================================= */}

      <section>
        <p className="text-sm font-semibold text-indigo-600">
          Student Portal
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back,{" "}
          <span className="text-indigo-600">
            {user?.name ||
              dashboard.student.name}
          </span>
          !
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Continue your learning journey and
          keep improving your skills.
        </p>
      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Enrolled Courses"
          value={statistics.totalCourses}
          subtitle="Courses you're currently taking"
          icon={
            <BookOpen size={22} />
          }
          iconBackground="bg-emerald-100"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Completed Courses"
          value={statistics.completedCourses}
          subtitle="Courses you've completed"
          icon={
            <CheckCircle2 size={22} />
          }
          iconBackground="bg-violet-100"
          iconColor="text-violet-600"
        />

        <StatCard
          title="Overall Progress"
          value={`${averageProgress}%`}
          subtitle="Average learning progress"
          icon={
            <TrendingUp size={22} />
          }
          iconBackground="bg-orange-100"
          iconColor="text-orange-600"
        />

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">

        {/* =================================================
            COURSES
        ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Enrolled Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current learning courses
              </p>
            </div>

            <button
              type="button"
              className="hidden items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 sm:flex"
            >
              View All
              <ArrowRight size={16} />
            </button>

          </div>

          {courses.length === 0 ? (
            <EmptyCourses />
          ) : (
            <div className="p-4 sm:p-6">

              {/* DESKTOP */}

              <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 md:block">

                <div className="min-w-[760px]">

                  <div className="grid grid-cols-[minmax(280px,2fr)_100px_minmax(150px,140px)_110px] bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">

                    <span>
                      Course
                    </span>

                    <span>
                      Lessons
                    </span>

                    <span>
                      Progress
                    </span>

                    <span>
                      Status
                    </span>

                  </div>

                  <div className="divide-y divide-slate-100">

                    {courses.map(
                      (course) => (
                        <CourseRow
                          key={
                            course.enrollmentId
                          }
                          course={course}
                        />
                      )
                    )}

                  </div>

                </div>

              </div>

              {/* MOBILE */}

              <div className="space-y-4 md:hidden">

                {courses.map(
                  (course) => (
                    <MobileCourseCard
                      key={
                        course.enrollmentId
                      }
                      course={course}
                    />
                  )
                )}

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <ProgressPanel
          progress={averageProgress}
        />

      </section>

      {/* =================================================
          LOWER CONTENT
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-2">

        <ActivityPanel
          courses={courses}
        />

        <LearningSummary
          statistics={statistics}
        />

      </section>

    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBackground,
  iconColor,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
}) {
  return (
    <div className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div className="min-w-0">

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

        </div>

        <div
          className={`
            flex h-12 w-12 shrink-0
            items-center justify-center
            rounded-2xl
            ${iconBackground}
            ${iconColor}
          `}
        >
          {icon}
        </div>

      </div>

      <p className="mt-3 text-xs text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}

/* =====================================================
   COURSE ROW
===================================================== */

function CourseRow({
  course,
}: {
  course: Course;
}) {
  const percentage =
    normalizePercentage(
      course.progress?.percentage
    );

  const completedLessons =
    course.progress?.completedLessons ?? 0;

  const totalLessons =
    course.progress?.totalLessons ?? 0;

  return (
    <div className="grid grid-cols-[minmax(280px,2fr)_100px_minmax(150px,140px)_110px] items-center px-5 py-5 transition hover:bg-slate-50">

      {/* COURSE */}

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <BookOpen size={19} />
        </div>

        <div className="min-w-0">

          <h3 className="truncate font-semibold text-slate-900">
            {course.course?.title ||
              "Untitled Course"}
          </h3>

          <p className="mt-1 truncate text-xs text-slate-400">
            {course.course?.description ||
              "No description available"}
          </p>

        </div>

      </div>

      {/* LESSONS */}

      <div>
        <p className="text-sm font-semibold text-slate-700">
          {completedLessons}
          {" / "}
          {totalLessons}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          lessons
        </p>
      </div>

      {/* PROGRESS */}

      <div className="pr-5">

        <div className="mb-2 flex justify-between">

          <span className="text-xs font-medium text-slate-500">
            Progress
          </span>

          <span className="text-xs font-bold text-indigo-600">
            {percentage}%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      {/* STATUS */}

      <CourseStatus
        percentage={percentage}
      />

    </div>
  );
}

/* =====================================================
   MOBILE COURSE
===================================================== */

function MobileCourseCard({
  course,
}: {
  course: Course;
}) {
  const percentage =
    normalizePercentage(
      course.progress?.percentage
    );

  const completedLessons =
    course.progress?.completedLessons ?? 0;

  const totalLessons =
    course.progress?.totalLessons ?? 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <BookOpen size={19} />
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="font-semibold text-slate-900">
            {course.course?.title ||
              "Untitled Course"}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {completedLessons}
            {" / "}
            {totalLessons}
            {" "}
            lessons
          </p>

        </div>

        <CourseStatus
          percentage={percentage}
        />

      </div>

      <div className="mt-4">

        <div className="mb-2 flex justify-between text-xs">

          <span className="text-slate-400">
            Progress
          </span>

          <span className="font-bold text-indigo-600">
            {percentage}%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   COURSE STATUS
===================================================== */

function CourseStatus({
  percentage,
}: {
  percentage: number;
}) {
  if (percentage >= 100) {
    return (
      <span className="whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
        Completed
      </span>
    );
  }

  if (percentage > 0) {
    return (
      <span className="whitespace-nowrap rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
        In Progress
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
      Not Started
    </span>
  );
}

/* =====================================================
   PROGRESS PANEL
===================================================== */

function ProgressPanel({
  progress,
}: {
  progress: number;
}) {
  const safeProgress =
    normalizePercentage(progress);

  const radius = 82;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (safeProgress / 100) *
      circumference;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            My Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overall learning progress
          </p>

        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          <MoreVertical size={18} />
        </button>

      </div>

      {/* CIRCLE */}

      <div className="relative mx-auto mt-8 flex h-56 w-56 items-center justify-center">

        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="-rotate-90"
        >

          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#eef0f5"
            strokeWidth="15"
          />

          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />

        </svg>

        <div className="absolute text-center">

          <p className="text-4xl font-bold text-slate-900">
            {safeProgress}%
          </p>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Complete
          </p>

        </div>

      </div>

      <div className="mt-5 text-center">

        <h3 className="font-semibold text-slate-900">
          {safeProgress >= 100
            ? "Course goal completed!"
            : safeProgress >= 75
            ? "You're almost there!"
            : safeProgress >= 40
            ? "Keep going!"
            : "Keep learning!"}
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Complete your lessons to
          improve your progress.
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   ACTIVITY PANEL
===================================================== */
function ActivityPanel({
  courses,
}: {
  courses: Course[];
}) {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            Learning Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current learning activity
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/student/courses")
          }
          className="hidden items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 sm:flex"
        >
          View All

          <ArrowRight size={16} />
        </button>

      </div>

      <div className="mt-6 space-y-3">

        {courses.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center">

            <p className="text-sm text-slate-500">
              No learning activity yet.
            </p>

          </div>
        ) : (
          courses
            .slice(0, 4)
            .map((course) => {

              const percentage =
                normalizePercentage(
                  course.progress?.percentage
                );

              const completedLessons =
                course.progress
                  ?.completedLessons ?? 0;

              const totalLessons =
                course.progress
                  ?.totalLessons ?? 0;

              return (
                <div
                  key={course.enrollmentId}
                  className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <PlayCircle size={20} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {course.course?.title ||
                        "Untitled Course"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {completedLessons}
                      {" / "}
                      {totalLessons}
                      {" "}
                      lessons completed
                    </p>

                  </div>

                  <span className="text-sm font-bold text-indigo-600">
                    {percentage}%
                  </span>

                </div>
              );
            })
        )}

      </div>

    </div>
  );
}
/* =====================================================
   LEARNING SUMMARY
===================================================== */

function LearningSummary({
  statistics,
}: {
  statistics: DashboardStatistics;
}) {
  const progress =
    normalizePercentage(
      statistics.averageProgress
    );

  const status =
    progress >= 75
      ? "Excellent"
      : progress >= 40
      ? "Good"
      : "Starting";

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            Learning Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your overall learning performance
          </p>

        </div>

        <TrendingUp
          size={21}
          className="text-indigo-600"
        />

      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">

        <SummaryItem
          label="Courses"
          value={statistics.totalCourses}
          icon={
            <BookOpen size={18} />
          }
        />

        <SummaryItem
          label="Completed"
          value={statistics.completedCourses}
          icon={
            <CheckCircle2 size={18} />
          }
        />

        <SummaryItem
          label="Progress"
          value={`${progress}%`}
          icon={
            <TrendingUp size={18} />
          }
        />

        <SummaryItem
          label="Status"
          value={status}
          icon={
            <Clock3 size={18} />
          }
        />

      </div>

    </div>
  );
}

/* =====================================================
   SUMMARY ITEM
===================================================== */

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <div className="flex items-center gap-2 text-indigo-600">

        {icon}

        <span className="text-xs font-medium text-slate-400">
          {label}
        </span>

      </div>

      <p className="mt-3 text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   EMPTY COURSES
===================================================== */

function EmptyCourses() {
  return (
    <div className="p-10 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <BookOpen size={28} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        No courses yet
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        You are not enrolled in any courses.
      </p>

    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function DashboardLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">

      <div className="text-center">

        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading your dashboard...
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Please wait a moment.
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   ERROR
===================================================== */

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 p-8">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="font-bold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {message}
          </p>

        </div>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>

      </div>

    </div>
  );
}

/* =====================================================
   NO DASHBOARD DATA
===================================================== */

function NoDashboardData() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <BookOpen size={28} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        No dashboard data
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        There is currently no data available
        for your account.
      </p>

    </div>
  );
}