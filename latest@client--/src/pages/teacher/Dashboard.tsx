import {
  BookOpen,
  Users,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../../services/api";

interface Course {
  id: number;
  title: string;
  description?: string | null;
  teacherId: number;
  _count?: {
    enrollments: number;
    lessons: number;
  };
}

export default function TeacherDashboard() {
  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  // =====================================================
  // LOAD MY COURSES
  // =====================================================

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * Do NOT use:
       *
       * /courses/teacher
       *
       * Use:
       *
       * /courses
       *
       * The backend gets the logged-in teacher's
       * userId from the JWT token.
       */

      const response =
        await api.get("/courses");

      console.log(
        "TEACHER COURSES RESPONSE:",
        response.data
      );

      const data =
        response.data.courses ||
        response.data.data ||
        [];

      setCourses(data);

    } catch (error: any) {
      console.error(
        "FAILED TO LOAD TEACHER COURSES:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:",
        error.response?.data
      );

      setCourses([]);

      setError(
        error.response?.data?.message ||
          "Failed to load courses."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalCourses =
    courses.length;

  const totalStudents =
    courses.reduce(
      (total, course) =>
        total +
        (course._count?.enrollments || 0),
      0
    );

  const totalLessons =
    courses.reduce(
      (total, course) =>
        total +
        (course._count?.lessons || 0),
      0
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>

          <p className="text-sm font-semibold text-indigo-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Teacher Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your courses, lessons, and students.
          </p>

        </div>

        <Link
          to="/teacher/courses/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >

          <Plus size={18} />

          Create Course

        </Link>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid gap-5 md:grid-cols-3">

        {/* COURSES */}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Courses
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading
                  ? "..."
                  : totalCourses}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

              <BookOpen size={23} />

            </div>

          </div>

        </div>

        {/* STUDENTS */}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Students
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading
                  ? "..."
                  : totalStudents}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

              <Users size={23} />

            </div>

          </div>

        </div>

        {/* LESSONS */}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Lessons
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading
                  ? "..."
                  : totalLessons}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">

              <FileText size={23} />

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          MY COURSES
      ================================================= */}

      <div className="mt-8 rounded-3xl border border-slate-100 bg-white shadow-sm">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 p-6">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              My Courses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your recently created courses.
            </p>

          </div>

          <Link
            to="/teacher/courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >

            View All

            <ArrowRight size={16} />

          </Link>

        </div>

        {/* COURSE LIST */}

        <div className="divide-y divide-slate-100">

          {/* LOADING */}

          {loading ? (

            <div className="p-6 text-sm text-slate-500">
              Loading courses...
            </div>

          ) : courses.length === 0 ? (

            /* EMPTY */

            <div className="p-10 text-center">

              <BookOpen
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                No courses yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first course to start teaching.
              </p>

              <Link
                to="/teacher/courses/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >

                <Plus size={17} />

                Create Course

              </Link>

            </div>

          ) : (

            /* COURSES */

            courses
              .slice(0, 5)
              .map((course) => (

                <div
                  key={course.id}
                  className="flex flex-col gap-4 p-6 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                >

                  {/* COURSE INFO */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

                      <BookOpen size={22} />

                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {course.title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {course.description ||
                          "No description"}
                      </p>

                    </div>

                  </div>

                  {/* COURSE STATS */}

                  <div className="flex items-center gap-6 text-sm">

                    <div>

                      <p className="text-xs text-slate-400">
                        Students
                      </p>

                      <p className="font-semibold text-slate-700">
                        {course._count?.enrollments ||
                          0}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Lessons
                      </p>

                      <p className="font-semibold text-slate-700">
                        {course._count?.lessons ||
                          0}
                      </p>

                    </div>

                    <Link
                      to={`/teacher/courses/${course.id}`}
                      className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Manage
                    </Link>

                  </div>

                </div>

              ))

          )}

        </div>

      </div>

    </div>
  );
}