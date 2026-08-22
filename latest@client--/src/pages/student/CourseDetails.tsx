import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  PlayCircle,
  UserRound,

  Trophy,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  order: number;
  completed?: boolean;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  teacher: Teacher | null;
}

interface Progress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

interface CourseDetails {
  enrollmentId: number;
  enrolledAt: string;
  course: Course;
  lessons: Lesson[];
  progress: Progress;
}

interface CourseResponse {
  success: boolean;
  message?: string;
  data: CourseDetails;
}

/* =====================================================
   MAIN
===================================================== */

export default function StudentCourseDetails() {
  const {
    courseId,
  } = useParams();

  const navigate = useNavigate();

  const [course, setCourse] =
    useState<CourseDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD COURSE
  ===================================================== */

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<CourseResponse>(
          `/student/courses/${courseId}`
        );

      if (!response.data?.data) {
        throw new Error(
          "Course data was not returned."
        );
      }

      setCourse(
        response.data.data
      );
    } catch (error: any) {
      console.error(
        "Course details error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load course."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return <CourseDetailsLoading />;
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-red-700">
              Unable to load course
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={loadCourse}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>

      </div>
    );
  }

  if (!course) {
    return null;
  }

  const percentage =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          course.progress?.percentage ?? 0
        )
      )
    );

  const lessons =
    Array.isArray(course.lessons)
      ? [...course.lessons].sort(
          (a, b) =>
            a.order - b.order
        )
      : [];

  const nextLesson =
    lessons.find(
      (lesson) =>
        !lesson.completed
    );

  return (
    <div className="space-y-6">

      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          navigate("/student/courses")
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={17} />

        Back to My Courses
      </button>

      {/* =================================================
          COURSE HERO
      ================================================= */}

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-900 p-7 text-white shadow-xl sm:p-9">

        {/* Decorative circles */}

        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10" />

        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">

          {/* COURSE INFO */}

          <div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">

              <GraduationCap
                size={15}
              />

              My Course

            </div>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">

              {course.course.title}

            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100">

              {course.course.description ||
                "Continue your learning journey and complete the lessons in this course."}

            </p>

            {/* TEACHER */}

            {course.course.teacher && (
              <div className="mt-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">

                  <UserRound
                    size={18}
                  />

                </div>

                <div>

                  <p className="text-xs text-indigo-200">
                    Instructor
                  </p>

                  <p className="text-sm font-semibold">
                    {course.course.teacher.name}
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* PROGRESS */}

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">

            <div className="flex items-center justify-between">

              <span className="text-sm text-indigo-100">
                Course Progress
              </span>

              <span className="text-2xl font-bold">
                {percentage}%
              </span>

            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">

              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-indigo-100">

              <span>
                {course.progress.completedLessons}
                {" / "}
                {course.progress.totalLessons}
                {" lessons"}
              </span>

              {percentage === 100 ? (
                <span className="flex items-center gap-1 font-semibold">
                  <Trophy size={14} />
                  Completed
                </span>
              ) : (
                <span>
                  Keep learning
                </span>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          QUICK STATS
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-3">

        <InfoCard
          icon={
            <BookOpen size={20} />
          }
          label="Total Lessons"
          value={
            course.progress.totalLessons
          }
        />

        <InfoCard
          icon={
            <CheckCircle2 size={20} />
          }
          label="Completed"
          value={
            course.progress.completedLessons
          }
        />

        <InfoCard
          icon={
            <Clock3 size={20} />
          }
          label="Remaining"
          value={
            Math.max(
              0,
              course.progress.totalLessons -
                course.progress.completedLessons
            )
          }
        />

      </section>

      {/* =================================================
          CONTINUE LEARNING
      ================================================= */}

      {nextLesson && (
        <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">

                <PlayCircle
                  size={22}
                />

              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Continue Learning
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {nextLesson.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Lesson {nextLesson.order}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/student/courses/${course.course.id}/lessons/${nextLesson.id}`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Continue

              <ArrowRight
                size={17}
              />
            </button>

          </div>

        </section>
      )}

      {/* =================================================
          LESSONS
      ================================================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="text-xl font-bold text-slate-900">
            Course Lessons
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Follow the lessons in order to complete the course.
          </p>

        </div>

        <div className="divide-y divide-slate-100">

          {lessons.length === 0 ? (
            <div className="p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <BookOpen
                  size={25}
                />

              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No lessons available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your instructor has not added any lessons yet.
              </p>

            </div>
          ) : (
            lessons.map(
              (lesson, index) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  courseId={
                    course.course.id
                  }
                  onOpen={() =>
                    navigate(
                      `/student/courses/${course.course.id}/lessons/${lesson.id}`
                    )
                  }
                />
              )
            )
          )}

        </div>

      </section>

    </div>
  );
}

/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <div>

          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   LESSON ITEM
===================================================== */

function LessonItem({
  lesson,
  index,
  onOpen,
}: {
  lesson: Lesson;
  index: number;
  courseId: number;
  onOpen: () => void;
}) {
  const completed =
    Boolean(lesson.completed);

  return (
    <div className="group flex items-center gap-4 px-5 py-5 transition hover:bg-slate-50 sm:px-6">

      {/* NUMBER / STATUS */}

      <div
        className={`
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          ${
            completed
              ? "bg-emerald-100 text-emerald-600"
              : "bg-indigo-50 text-indigo-600"
          }
        `}
      >
        {completed ? (
          <CheckCircle2
            size={21}
          />
        ) : (
          <span className="text-sm font-bold">
            {index + 1}
          </span>
        )}
      </div>

      {/* CONTENT */}

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
            {lesson.title}
          </h3>

          {completed && (
            <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 sm:inline-block">
              Completed
            </span>
          )}

        </div>

        <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
          {lesson.description ||
            `Lesson ${lesson.order}`}
        </p>

      </div>

      {/* ACTION */}

      <button
        type="button"
        onClick={onOpen}
        className={`
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl
          transition
          ${
            completed
              ? "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }
        `}
        title={
          completed
            ? "Review lesson"
            : "Start lesson"
        }
      >
        {completed ? (
          <CheckCircle2
            size={18}
          />
        ) : (
          <ArrowRight
            size={18}
          />
        )}
      </button>

    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function CourseDetailsLoading() {
  return (
    <div className="space-y-6">

      <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />

      <div className="h-64 animate-pulse rounded-[2rem] bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-3">

        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-3xl bg-slate-200"
            />
          )
        )}

      </div>

      <div className="overflow-hidden rounded-3xl bg-white">

        <div className="h-24 animate-pulse bg-slate-200" />

        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-20 animate-pulse border-t border-slate-100 bg-slate-50"
            />
          )
        )}

      </div>

    </div>
  );
}