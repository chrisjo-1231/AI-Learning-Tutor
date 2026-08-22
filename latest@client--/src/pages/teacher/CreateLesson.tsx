import {
  ArrowLeft,
  BookOpen,
  Save,
} from "lucide-react";

import {
  type FormEvent,
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

interface Course {
  id: number;
  title: string;
  description: string | null;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function CreateLesson() {
  const {
    courseId,
  } = useParams<{
    courseId: string;
  }>();

  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [course, setCourse] =
    useState<Course | null>(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [order, setOrder] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingCourse, setLoadingCourse] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =====================================================
     LOAD COURSE
  ===================================================== */

  useEffect(() => {
    if (!courseId) {
      setError(
        "Course ID is missing."
      );

      setLoadingCourse(false);

      return;
    }

    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoadingCourse(true);
      setError("");

      const response =
        await api.get(
          `/courses/${courseId}`
        );

      console.log(
        "CREATE LESSON COURSE RESPONSE:",
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

      setCourse(
        loadedCourse
      );

    } catch (error: any) {
      console.error(
        "LOAD COURSE ERROR:",
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
          "Failed to load course."
      );

    } finally {
      setLoadingCourse(false);
    }
  };

  /* =====================================================
     CREATE LESSON
  ===================================================== */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /* -----------------------------------------------
       COURSE ID
    ----------------------------------------------- */

    if (!courseId) {
      setError(
        "Course ID is missing."
      );

      return;
    }

    /* -----------------------------------------------
       TITLE
    ----------------------------------------------- */

    const cleanTitle =
      title.trim();

    if (!cleanTitle) {
      setError(
        "Lesson title is required."
      );

      return;
    }

    /* -----------------------------------------------
       CONTENT
    ----------------------------------------------- */

    const cleanContent =
      content.trim();

    if (!cleanContent) {
      setError(
        "Lesson content is required."
      );

      return;
    }

    /* -----------------------------------------------
       ORDER
    ----------------------------------------------- */

    const lessonOrder =
      Number(order);

    if (
      !order.trim() ||
      !Number.isInteger(lessonOrder) ||
      lessonOrder < 1
    ) {
      setError(
        "Lesson order must be a whole number starting from 1."
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "CREATING LESSON:",
        {
          courseId,
          title: cleanTitle,
          content: cleanContent,
          order: lessonOrder,
        }
      );

      const response =
        await api.post(
          `/lessons/course/${courseId}`,
          {
            title: cleanTitle,
            content: cleanContent,
            order: lessonOrder,
          }
        );

      console.log(
        "CREATE LESSON RESPONSE:",
        response.data
      );

      setSuccess(
        "Lesson created successfully!"
      );

      /* -----------------------------------------------
         CLEAR FORM
      ----------------------------------------------- */

      setTitle("");
      setContent("");

      /* -----------------------------------------------
         REDIRECT
      ----------------------------------------------- */

      setTimeout(() => {
        navigate(
          `/teacher/courses/${courseId}`
        );
      }, 700);

    } catch (error: any) {
      console.error(
        "CREATE LESSON ERROR:",
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

      setError(
        error.response?.data?.message ||
          "Failed to create lesson."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING COURSE
  ===================================================== */

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

        <div className="mx-auto max-w-4xl">

          <Link
            to="/teacher/courses"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to My Courses
          </Link>

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
     COURSE NOT FOUND
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

      <div className="mx-auto max-w-4xl">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to={`/teacher/courses/${courseId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to Course
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">

              <BookOpen size={27} />

            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold text-indigo-600">
                {course.title}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Add Lesson
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Create a new lesson for your students.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-600">
              {success}
            </div>
          )}

          {/* =================================================
              LESSON TITLE
          ================================================= */}

          <div className="mb-6">

            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Lesson Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Introduction to Variables"
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

          </div>

          {/* =================================================
              LESSON ORDER
          ================================================= */}

          <div className="mb-6">

            <label
              htmlFor="order"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Lesson Order
            </label>

            <input
              id="order"
              type="number"
              min="1"
              step="1"
              value={order}
              onChange={(e) =>
                setOrder(e.target.value)
              }
              placeholder="1"
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              Use 1 for the first lesson, 2 for the second,
              and so on.
            </p>

          </div>

          {/* =================================================
              LESSON CONTENT
          ================================================= */}

          <div className="mb-8">

            <label
              htmlFor="content"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Lesson Content
            </label>

            <textarea
              id="content"
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Write the lesson content here..."
              rows={12}
              disabled={loading}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              Add explanations, examples, instructions,
              and other learning materials.
            </p>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <Link
              to={`/teacher/courses/${courseId}`}
              className="rounded-xl px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />

              {loading
                ? "Creating..."
                : "Create Lesson"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}