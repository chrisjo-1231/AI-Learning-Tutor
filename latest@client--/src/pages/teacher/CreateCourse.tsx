import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/courses", {
        title: title.trim(),
        description: description.trim(),
      });

      setSuccess("Course created successfully!");

      setTimeout(() => {
        navigate("/teacher/courses");
      }, 700);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create course."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8">

        <Link
          to="/teacher/courses"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to My Courses
        </Link>

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <BookOpen size={27} />
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Create Course
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create a new course for your students.
            </p>
          </div>

        </div>

      </div>

      {/* FORM */}

      <div className="max-w-3xl">

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
              disabled={loading}
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
                setDescription(e.target.value)
              }
              placeholder="Describe what students will learn in this course..."
              rows={6}
              disabled={loading}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-400">
              Give students a clear idea of what this
              course covers.
            </p>

          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <Link
              to="/teacher/courses"
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
                : "Create Course"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}