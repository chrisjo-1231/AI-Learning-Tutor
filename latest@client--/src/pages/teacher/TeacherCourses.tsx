import {
  BookOpen,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

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

export default function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses");

      setCourses(
        response.data.courses ||
          response.data.data ||
          []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(courseId);
      setError("");

      await api.delete(`/courses/${courseId}`);

      setCourses((prev) =>
        prev.filter((course) => course.id !== courseId)
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete course."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Teacher Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            My Courses
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage your courses.
          </p>
        </div>

        <Link
          to="/teacher/courses/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create Course
        </Link>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* COURSES */}

      {loading ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <BookOpen size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No courses yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create your first course to start teaching.
          </p>

          <Link
            to="/teacher/courses/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            Create Course
          </Link>

        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {courses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >

              {/* COVER */}

              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-700">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <BookOpen size={27} />
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-6">

                <h2 className="text-lg font-bold text-slate-900">
                  {course.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {course.description ||
                    "No description available."}
                </p>

                {/* STATS */}

                <div className="mt-5 flex gap-5 border-t border-slate-100 pt-4">

                  <div>
                    <p className="text-xs text-slate-400">
                      Students
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {course._count?.enrollments || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Lessons
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {course._count?.lessons || 0}
                    </p>
                  </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-6 grid grid-cols-3 gap-2">

                  <Link
                    to={`/teacher/courses/${course.id}`}
                    className="flex items-center justify-center gap-1 rounded-xl bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                  >
                    Manage
                  </Link>

                  <Link
                    to={`/teacher/courses/${course.id}/edit`}
                    className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(course.id)
                    }
                    disabled={
                      deletingId === course.id
                    }
                    className="flex items-center justify-center gap-1 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={14} />

                    {deletingId === course.id
                      ? "..."
                      : "Delete"}
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}