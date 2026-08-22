import {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  UserRound,
  Search,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


import api from "../../services/api";

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  order: number;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Course {
  enrollmentId: number;

  enrolledAt: string;

  course: {
    id: number;
    title: string;
    description: string | null;
    teacher: Teacher | null;
  };

  lessons: Lesson[];

  progress: {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  };
}

export default function StudentCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/student/courses");

      setCourses(
        response.data.data || []
      );
    } catch (error: any) {
      console.error(
        "Student courses error:",
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

  const filteredCourses =
    courses.filter((item) =>
      item.course.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {
    return <CoursesLoading />;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8">
        <h2 className="font-bold text-red-700">
          Unable to load courses
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={loadCourses}
          className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <section>

        <p className="text-sm font-medium text-indigo-600">
          Student Portal
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Courses
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Continue learning and track your
              progress across your enrolled courses.
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

      {/* SEARCH */}

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

        <div className="relative">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search your courses..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />

        </div>

      </section>

      {/* EMPTY */}

      {filteredCourses.length === 0 ? (
        <EmptyCourses
          searched={search.length > 0}
        />
      ) : (

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredCourses.map(
            (item) => (
              <CourseCard
                key={item.enrollmentId}
                course={item}
                onOpen={() =>
                  navigate(
                    `/student/courses/${item.course.id}`
                  )
                }
              />
            )
          )}

        </section>

      )}

    </div>
  );
}

/* =====================================================
   COURSE CARD
===================================================== */

function CourseCard({
  course,
  onOpen,
}: {
  course: Course;
  onOpen: () => void;
}) {
  const percentage =
    course.progress.percentage;

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* TOP */}

      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800">

        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10" />

        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative flex h-full items-center justify-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">

            <BookOpen size={30} />

          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-6">

        <div className="flex items-start justify-between gap-3">

          <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
            {course.course.title}
          </h2>

          <Status
            percentage={percentage}
          />

        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.course.description ||
            "No course description available."}
        </p>

        {/* TEACHER */}

        {course.course.teacher && (
          <div className="mt-5 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <UserRound size={15} />
            </div>

            <div className="min-w-0">

              <p className="text-xs text-slate-400">
                Instructor
              </p>

              <p className="truncate text-sm font-semibold text-slate-700">
                {course.course.teacher.name}
              </p>

            </div>

          </div>
        )}

        {/* LESSONS */}

        <div className="mt-5 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <BookOpen
              size={16}
              className="text-slate-400"
            />

            <span className="text-sm text-slate-500">
              {course.progress.totalLessons}{" "}
              {course.progress.totalLessons === 1
                ? "Lesson"
                : "Lessons"}
            </span>

          </div>

          <span className="text-sm font-bold text-indigo-600">
            {percentage}%
          </span>

        </div>

        {/* PROGRESS */}

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

        {/* BUTTON */}

        <button
          onClick={onOpen}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >

          {percentage === 0
            ? "Start Learning"
            : percentage === 100
            ? "Review Course"
            : "Continue Learning"}

          <ArrowRight size={16} />

        </button>

      </div>

    </div>
  );
}

/* =====================================================
   STATUS
===================================================== */

function Status({
  percentage,
}: {
  percentage: number;
}) {
  if (percentage === 100) {
    return (
      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
        Completed
      </span>
    );
  }

  if (percentage > 0) {
    return (
      <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
        In Progress
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
      Not Started
    </span>
  );
}

/* =====================================================
   EMPTY
===================================================== */

function EmptyCourses({
  searched,
}: {
  searched: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

        {searched ? (
          <Search size={28} />
        ) : (
          <BookOpen size={28} />
        )}

      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        {searched
          ? "No courses found"
          : "No courses yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {searched
          ? "Try searching using another course title."
          : "You are not enrolled in any courses yet."}
      </p>

    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function CoursesLoading() {
  return (
    <div className="space-y-6">

      <div className="h-20 animate-pulse rounded-3xl bg-slate-200" />

      <div className="h-16 animate-pulse rounded-3xl bg-slate-200" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >

              <div className="h-32 animate-pulse bg-slate-200" />

              <div className="space-y-4 p-6">

                <div className="h-5 animate-pulse rounded bg-slate-200" />

                <div className="h-10 animate-pulse rounded bg-slate-100" />

                <div className="h-8 animate-pulse rounded bg-slate-100" />

                <div className="h-3 animate-pulse rounded-full bg-slate-200" />

                <div className="h-11 animate-pulse rounded-xl bg-slate-200" />

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}