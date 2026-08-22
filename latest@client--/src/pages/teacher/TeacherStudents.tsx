import {
  BookOpen,
  Loader2,
  Mail,
  Search,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface Student {
  id: number;
  name: string;
  email: string;
  profileImage?: string | null;

  course: {
    id: number;
    title: string;
  };

  enrolledAt: string;
  progress: number;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function TeacherStudents() {
  const [students, setStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* ===================================================
     IMAGE URL
  =================================================== */

  const getImageUrl = (
    imagePath:
      | string
      | null
      | undefined
  ) => {
    if (!imagePath) {
      return "";
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  /* ===================================================
     LOAD STUDENTS
  =================================================== */

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/teacher/students"
        );

      console.log(
        "TEACHER STUDENTS RESPONSE:",
        response.data
      );

      const data =
        response.data?.data;

      setStudents(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error: any) {
      console.error(
        "FAILED TO LOAD TEACHER STUDENTS:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load students."
      );

    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    loadStudents();
  }, []);

  /* ===================================================
     FILTER
  =================================================== */

  const filteredStudents =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return students;
      }

      return students.filter(
        (student) =>
          student.name
            .toLowerCase()
            .includes(keyword) ||
          student.email
            .toLowerCase()
            .includes(keyword) ||
          student.course.title
            .toLowerCase()
            .includes(keyword)
      );
    }, [students, search]);

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">

        <div className="text-center">

          <Loader2
            size={36}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading students...
          </p>

        </div>

      </div>
    );
  }

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <p className="text-sm font-semibold text-indigo-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View students enrolled in your courses.
          </p>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

            <button
              onClick={loadStudents}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* =================================================
            TOP STAT
        ================================================= */}

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          {/* TOTAL ENROLLMENTS */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Enrollments
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {students.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Users size={23} />
              </div>

            </div>

          </div>

          {/* UNIQUE STUDENTS */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Students
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {
                    new Set(
                      students.map(
                        (student) =>
                          student.id
                      )
                    ).size
                  }
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <User size={23} />
              </div>

            </div>

          </div>

          {/* AVERAGE PROGRESS */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Average Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">

                  {students.length === 0
                    ? 0
                    : Math.round(
                        students.reduce(
                          (
                            total,
                            student
                          ) =>
                            total +
                            student.progress,
                          0
                        ) /
                          students.length
                      )}
                  %

                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <TrendingUp size={23} />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            STUDENTS CARD
        ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Enrolled Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Students enrolled in your courses.
              </p>

            </div>

            {/* SEARCH */}

            <div className="relative w-full md:w-80">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search students..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
              />

            </div>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredStudents.length === 0 ? (

            <div className="p-12 text-center">

              <Users
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                {search
                  ? "No students found"
                  : "No enrolled students yet"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try searching by name, email, or course."
                  : "Students will appear here once they enroll in your courses."}
              </p>

            </div>

          ) : (

            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50 text-left">

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Course
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Enrolled
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Progress
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredStudents.map(
                    (student) => (

                      <tr
                        key={`${student.id}-${student.course.id}`}
                        className="transition hover:bg-slate-50"
                      >

                        {/* STUDENT */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">

                              {student.profileImage ? (

                                <img
                                  src={getImageUrl(
                                    student.profileImage
                                  )}
                                  alt={student.name}
                                  className="h-full w-full object-cover"
                                />

                              ) : (

                                student.name
                                  .charAt(0)
                                  .toUpperCase()

                              )}

                            </div>

                            <div>

                              <p className="font-semibold text-slate-800">
                                {student.name}
                              </p>

                              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">

                                <Mail size={13} />

                                {student.email}

                              </div>

                            </div>

                          </div>

                        </td>

                        {/* COURSE */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <BookOpen size={17} />
                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              {student.course.title}
                            </span>

                          </div>

                        </td>

                        {/* ENROLLED DATE */}

                        <td className="px-6 py-5">

                          <p className="text-sm text-slate-600">
                            {new Date(
                              student.enrolledAt
                            ).toLocaleDateString(
                              "en-US",
                              {
                                month:
                                  "short",
                                day:
                                  "numeric",
                                year:
                                  "numeric",
                              }
                            )}
                          </p>

                        </td>

                        {/* PROGRESS */}

                        <td className="px-6 py-5">

                          <div className="w-48">

                            <div className="mb-1.5 flex items-center justify-between">

                              <span className="text-xs font-medium text-slate-500">
                                Progress
                              </span>

                              <span className="text-xs font-bold text-indigo-600">
                                {student.progress}%
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-indigo-600 transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      student.progress
                                    )
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}