import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Search,
} from "lucide-react";

import api from "../../services/api";
import { enrollInCourse } from "../../services/enrollmentService";

interface Course {
  id: number;
  title: string;
  description: string | null;

  teacher?: {
    id: number;
    name: string;
  } | null;
}

interface Enrollment {
  course: {
    id: number;
  };
}

export default function BrowseCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);

  const [enrollingId, setEnrollingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // LOAD COURSES + EXISTING ENROLLMENTS
  // =====================================================

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      // =================================================
      // GET ALL AVAILABLE COURSES FOR STUDENT
      // =================================================

      const coursesResponse =
        await api.get("/courses/browse");

      setCourses(
        coursesResponse.data.courses || []
      );

      // =================================================
      // GET STUDENT ENROLLMENTS
      // =================================================

      const enrollmentResponse =
        await api.get("/enrollments/my-courses");

      const enrollments: Enrollment[] =
        enrollmentResponse.data.courses || [];

      setEnrolledIds(
        enrollments
          .map(
            (item) => item.course?.id
          )
          .filter(
            (id): id is number =>
              typeof id === "number"
          )
      );

    } catch (error: any) {
      console.error(
        "LOAD COURSES ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENROLL
  // =====================================================

  const handleEnroll = async (
    courseId: number
  ) => {
    try {
      setEnrollingId(courseId);
      setError("");

      await enrollInCourse(courseId);

      // Add course to enrolled list
      setEnrolledIds((prev) => {
        if (prev.includes(courseId)) {
          return prev;
        }

        return [...prev, courseId];
      });

    } catch (error: any) {
      console.error(
        "ENROLL COURSE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to enroll in course."
      );
    } finally {
      setEnrollingId(null);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCourses =
    courses.filter((course) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        course.title
          .toLowerCase()
          .includes(searchText) ||
        course.description
          ?.toLowerCase()
          .includes(searchText) ||
        course.teacher?.name
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="text-sm font-medium text-slate-500">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <section>
        <p className="text-sm font-medium text-indigo-600">
          Student Portal
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Browse Courses
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Discover courses and start learning.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">

            <GraduationCap
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm font-semibold text-slate-700">
              {courses.length}{" "}
              {courses.length === 1
                ? "Course"
                : "Courses"}
            </span>

          </div>

        </div>
      </section>

      {/* =================================================
          SEARCH
      ================================================= */}

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

        <div className="relative">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search courses..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
          />

        </div>

      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 p-4 text-sm text-red-600">

          <span>
            {error}
          </span>

          <button
            onClick={loadCourses}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
          >
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          NO COURSES
      ================================================= */}

      {!error &&
        filteredCourses.length === 0 && (
          <section className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <BookOpen
                size={28}
                className="text-slate-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No courses found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try searching for another course."
                : "There are no available courses yet."}
            </p>

          </section>
        )}

      {/* =================================================
          COURSES
      ================================================= */}

      {filteredCourses.length > 0 && (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredCourses.map((course) => {

            const enrolled =
              enrolledIds.includes(
                course.id
              );

            const isEnrolling =
              enrollingId === course.id;

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* =====================================
                    COVER
                ===================================== */}

                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">

                    <BookOpen size={30} />

                  </div>

                </div>

                {/* =====================================
                    CONTENT
                ===================================== */}

                <div className="p-6">

                  <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
                    {course.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {course.description ||
                      "No course description available."}
                  </p>

                  {/* =================================
                      TEACHER
                  ================================= */}

                  {course.teacher && (
                    <div className="mt-4">

                      <p className="text-xs text-slate-400">
                        Instructor
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {course.teacher.name}
                      </p>

                    </div>
                  )}

                  {/* =================================
                      ENROLL BUTTON
                  ================================= */}

                  {enrolled ? (

                    <button
                      disabled
                      className="mt-6 w-full cursor-default rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-600"
                    >
                      ✓ Enrolled
                    </button>

                  ) : (

                    <button
                      onClick={() =>
                        handleEnroll(course.id)
                      }
                      disabled={isEnrolling}
                      className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isEnrolling
                        ? "Enrolling..."
                        : "Enroll Now"}
                    </button>

                  )}

                </div>

              </div>
            );
          })}

        </section>
      )}

      {/* =================================================
          SEARCH RESULT COUNT
      ================================================= */}

      {courses.length > 0 && (
        <div className="pb-4 text-center text-xs text-slate-400">
          Showing{" "}
          {filteredCourses.length} of{" "}
          {courses.length} courses
        </div>
      )}

    </div>
  );
}