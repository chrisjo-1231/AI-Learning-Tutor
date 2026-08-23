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

interface Course {
  id: number;
  title: string;
  description: string | null;
}

export default function EditLesson() {
  const { courseId, lessonId } =
    useParams();

  const navigate = useNavigate();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [order, setOrder] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // LOAD LESSON
  // ==========================================

  useEffect(() => {
    if (!lessonId) {
      setError("Lesson ID is missing.");
      setLoading(false);
      return;
    }

    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/lessons/${lessonId}`
      );

      console.log(
        "LESSON RESPONSE:",
        response.data
      );

      const lessonData =
        response.data.lesson;

      if (!lessonData) {
        setError(
          "Lesson data was not found."
        );
        return;
      }

      setTitle(
        lessonData.title || ""
      );

      setContent(
        lessonData.content || ""
      );

      setOrder(
        String(lessonData.order ?? "")
      );

      // ======================================
      // COURSE INFORMATION
      // ======================================

      if (lessonData.course) {
        setCourse(
          lessonData.course
        );
      } else if (courseId) {
        await loadCourse();
      }

    } catch (error: any) {
      console.error(
        "LOAD LESSON ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load lesson."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD COURSE
  // ==========================================

  const loadCourse = async () => {
    if (!courseId) return;

    try {
      const response = await api.get(
        `/courses/${courseId}`
      );

      console.log(
        "COURSE RESPONSE:",
        response.data
      );

      setCourse(
        response.data.course ||
          response.data.data ||
          null
      );

    } catch (error: any) {
      console.error(
        "LOAD COURSE ERROR:",
        error
      );
    }
  };

  // ==========================================
  // UPDATE LESSON
  // ==========================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!lessonId) {
      setError(
        "Lesson ID is missing."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Lesson title is required."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Lesson content is required."
      );
      return;
    }

    if (
      !order ||
      Number(order) < 1
    ) {
      setError(
        "Lesson order must be at least 1."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await api.put(
          `/lessons/${lessonId}`,
          {
            title: title.trim(),
            content: content.trim(),
            order: Number(order),
          }
        );

      console.log(
        "UPDATE LESSON RESPONSE:",
        response.data
      );

      setSuccess(
        "Lesson updated successfully!"
      );

      setTimeout(() => {
        navigate(
          `/teacher/courses/${courseId}`
        );
      }, 700);

    } catch (error: any) {
      console.error(
        "UPDATE LESSON ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update lesson."
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading lesson...
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      {/* BACK */}

      <Link
        to={`/teacher/courses/${courseId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft size={17} />

        Back to Course
      </Link>

      {/* HEADER */}

      <div className="mb-8">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <BookOpen size={27} />
          </div>

          <div>

            <p className="text-sm font-semibold text-indigo-600">
              {course?.title ||
                "Course"}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Edit Lesson
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Update this lesson for your
              students.
            </p>

          </div>

        </div>

      </div>

      {/* FORM */}

      <div className="max-w-4xl">

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-600">
              {success}
            </div>
          )}

          {/* TITLE */}

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
                setTitle(
                  e.target.value
                )
              }
              placeholder="e.g. Introduction to Variables"
              disabled={saving}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

          </div>

          {/* ORDER */}

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
              value={order}
              onChange={(e) =>
                setOrder(
                  e.target.value
                )
              }
              placeholder="1"
              disabled={saving}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              This determines the order in
              which students will see the
              lessons.
            </p>

          </div>

          {/* CONTENT */}

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
                setContent(
                  e.target.value
                )
              }
              placeholder="Write the lesson content here..."
              rows={12}
              disabled={saving}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              Update explanations, examples,
              instructions, and other learning
              materials.
            </p>

          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <Link
              to={`/teacher/courses/${courseId}`}
              className="rounded-xl px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
