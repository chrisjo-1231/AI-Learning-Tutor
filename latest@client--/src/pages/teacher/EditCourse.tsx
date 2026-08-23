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

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
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
  // LOAD COURSE
  // ==========================================

  useEffect(() => {
    if (!courseId) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/courses/${courseId}`
      );

      console.log(
        "EDIT COURSE RESPONSE:",
        response.data
      );

      const courseData =
        response.data.course ||
        response.data.data;

      if (!courseData) {
        setError(
          "Course data was not found."
        );
        return;
      }

      setTitle(
        courseData.title || ""
      );

      setDescription(
        courseData.description || ""
      );

    } catch (error: any) {
      console.error(
        "LOAD COURSE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load course."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE COURSE
  // ==========================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!courseId) {
      setError(
        "Course ID is missing."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Course title is required."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await api.put(
          `/courses/${courseId}`,
          {
            title: title.trim(),
            description:
              description.trim() || null,
          }
        );

      console.log(
        "UPDATE COURSE RESPONSE:",
        response.data
      );

      setSuccess(
        "Course updated successfully!"
      );

      setTimeout(() => {
        navigate(
          `/teacher/courses/${courseId}`
        );
      }, 700);

    } catch (error: any) {
      console.error(
        "UPDATE COURSE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update course."
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
          Loading course...
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
              Course Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Edit Course
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Update your course information.
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
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-600">
              {success}
            </div>
          )}

          {/* TITLE */}

          <div className="mb-6">

            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Course Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Introduction to Python"
              disabled={saving}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

          </div>

          {/* DESCRIPTION */}

          <div className="mb-8">

            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Course Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Describe what students will learn in this course..."
              rows={8}
              disabled={saving}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              Give students a short overview of
              what they will learn.
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
