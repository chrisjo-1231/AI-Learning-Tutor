import {
  ArrowLeft,
  BookOpen,
  Edit,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface Lesson {
  id: number;
  title: string;
  content: string;
  order: number;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  teacherId: number;
  _count?: {
    enrollments: number;
    lessons: number;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function ManageCourse() {
  const {
    courseId,
  } = useParams();

  const navigate =
    useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [course, setCourse] =
    useState<Course | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [students, setStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    if (!courseId) {
      setError(
        "Course ID is missing."
      );

      setLoading(false);

      return;
    }

    loadCourse();
  }, [courseId]);

  /* =====================================================
     LOAD COURSE
     ONLY LOGGED-IN TEACHER'S COURSE
  ===================================================== */
const loadCourse = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/courses/${courseId}`
    );

    console.log(
      "TEACHER COURSE RESPONSE:",
      response.data
    );

    const loadedCourse =
      response.data.course ||
      response.data.data ||
      null;

    if (!loadedCourse) {
      setCourse(null);

      setError(
        "Course not found or you do not own this course."
      );

      return;
    }

    setCourse(loadedCourse);

    await Promise.all([
      loadLessons(),
      loadStudents(),
    ]);

  } catch (error: any) {
    console.error(
      "LOAD TEACHER COURSE ERROR:",
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

    setCourse(null);

    setError(
      error.response?.data?.message ||
        "Course not found or you do not own this course."
    );

  } finally {
    setLoading(false);
  }
};

  /* =====================================================
     LOAD LESSONS
  ===================================================== */

  const loadLessons = async () => {
    try {
      const response =
        await api.get(
          `/lessons/course/${courseId}`
        );

      console.log(
        "LESSONS RESPONSE:",
        response.data
      );

      setLessons(
        response.data.lessons ||
          response.data.data ||
          []
      );

    } catch (error: any) {
      console.error(
        "LOAD LESSONS ERROR:",
        error
      );

      /*
       * Do not destroy the whole page
       * if lessons fail to load.
       */

      setLessons([]);

      setError(
        error.response?.data?.message ||
          "Failed to load lessons."
      );
    }
  };

  /* =====================================================
     LOAD ENROLLED STUDENTS
  ===================================================== */

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);

      console.log(
        "LOADING ENROLLED STUDENTS..."
      );

      console.log(
        "COURSE ID:",
        courseId
      );

      const url =
        `/enrollments/course/${courseId}/students`;

      console.log(
        "STUDENTS URL:",
        url
      );

      const response =
        await api.get(url);

      console.log(
        "STUDENTS RESPONSE:",
        response.data
      );

      setStudents(
        response.data.students ||
          response.data.data ||
          []
      );

    } catch (error: any) {
      console.error(
        "LOAD ENROLLED STUDENTS ERROR:",
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

      setStudents([]);

      setError(
        error.response?.data?.message ||
          "Failed to load enrolled students."
      );

    } finally {
      setLoadingStudents(false);
    }
  };

  /* =====================================================
     DELETE LESSON
  ===================================================== */

  const handleDelete = async (
    lessonId: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this lesson?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        lessonId
      );

      setError("");

      await api.delete(
        `/lessons/${lessonId}`
      );

      setLessons(
        (prev) =>
          prev.filter(
            (lesson) =>
              lesson.id !== lessonId
          )
      );

    } catch (error: any) {
      console.error(
        "DELETE LESSON ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete lesson."
      );

    } finally {
      setDeletingId(null);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

              <BookOpen
                size={27}
                className="animate-pulse"
              />

            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Loading course...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we load your course.
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     COURSE NOT FOUND / NOT OWNER
  ===================================================== */

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

        <div className="mx-auto max-w-3xl">

          <Link
            to="/teacher/courses"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />

            Back to My Courses
          </Link>

          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">

              <BookOpen size={30} />

            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Course Not Found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error ||
                "This course does not exist or you do not have permission to manage it."}
            </p>

            <Link
              to="/teacher/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <ArrowLeft size={17} />

              Back to My Courses
            </Link>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/teacher/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />

          Back to My Courses
        </Link>

        {/* =================================================
            COURSE HEADER
        ================================================= */}

        <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

            {/* COURSE INFO */}

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">

                <BookOpen size={27} />

              </div>

              <div>

                <p className="text-sm font-semibold text-indigo-600">
                  Course Management
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  {course.title}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {course.description ||
                    "No course description available."}
                </p>

              </div>

            </div>

            {/* EDIT COURSE */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/teacher/courses/${courseId}/edit`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              <Edit size={17} />

              Edit Course
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="shrink-0 font-bold text-red-400 hover:text-red-600"
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            COURSE STATS
        ================================================= */}

        <div className="mb-8 grid gap-5 md:grid-cols-3">

          {/* STUDENTS */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Enrolled Students
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

          {/* LESSONS */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Lessons
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {lessons.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">

                <BookOpen size={23} />

              </div>

            </div>

          </div>

          {/* COURSE ID */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Course ID
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  #{course.id}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                <BookOpen size={23} />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            ENROLLED STUDENTS
        ================================================= */}

        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-slate-100 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                <Users size={21} />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Enrolled Students
                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {students.length} student
                  {students.length !== 1
                    ? "s"
                    : ""}{" "}
                  enrolled

                </p>

              </div>

            </div>

          </div>

          {/* LOADING */}

          {loadingStudents ? (

            <div className="p-8 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                <Users
                  size={22}
                  className="animate-pulse"
                />

              </div>

              <p className="mt-4 text-sm text-slate-500">
                Loading students...
              </p>

            </div>

          ) : students.length === 0 ? (

            /* EMPTY */

            <div className="p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <Users size={25} />

              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No students enrolled yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Students who enroll in this
                course will appear here.
              </p>

            </div>

          ) : (

            /* STUDENTS */

            <div className="divide-y divide-slate-100">

              {students.map(
                (student) => (

                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-5 transition hover:bg-slate-50"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600">

                      {student.name
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold text-slate-900">
                        {student.name}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {student.email}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* =================================================
            LESSONS
        ================================================= */}

        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">

          {/* HEADER */}

          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Lessons
              </h2>

              <p className="mt-1 text-sm text-slate-500">

                {lessons.length} lesson
                {lessons.length !== 1
                  ? "s"
                  : ""}{" "}
                in this course

              </p>

            </div>

            <Link
              to={`/teacher/courses/${courseId}/lessons/create`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >

              <Plus size={18} />

              Add Lesson

            </Link>

          </div>

          {/* LESSON LIST */}

          {lessons.length === 0 ? (

            <div className="p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

                <BookOpen size={30} />

              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No lessons yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Add your first lesson to start
                building this course.
              </p>

              <Link
                to={`/teacher/courses/${courseId}/lessons/create`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >

                <Plus size={18} />

                Add First Lesson

              </Link>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {lessons.map(
                (lesson) => (

                  <div
                    key={lesson.id}
                    className="flex flex-col gap-4 p-6 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                  >

                    {/* LESSON INFO */}

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">

                        {lesson.order}

                      </div>

                      <div className="min-w-0">

                        <h3 className="font-semibold text-slate-900">
                          {lesson.title}
                        </h3>

                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                          {lesson.content}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">

                      <Link
                        to={`/teacher/courses/${courseId}/lessons/${lesson.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                      >

                        <Edit size={16} />

                        Edit

                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            lesson.id
                          )
                        }
                        disabled={
                          deletingId ===
                          lesson.id
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <Trash2 size={16} />

                        {deletingId ===
                        lesson.id
                          ? "Deleting..."
                          : "Delete"}

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}