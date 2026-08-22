import {
  BookOpen,
  Edit,
  Plus,
  Search,
  Trash2,
  ClipboardList,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface Quiz {
  id: number;
  title: string;
  createdAt: string;
  lessonId: number;

  lesson?: {
    id: number;
    title: string;

    course?: {
      id: number;
      title: string;
    };
  };

  questions?: {
    id: number;
  }[];
}

/* =====================================================
   COMPONENT
===================================================== */

export default function TeacherQuizzes() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] =
    useState<Quiz[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  /* ===================================================
     LOAD QUIZZES
  =================================================== */

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/quizzes");

      console.log(
        "QUIZZES RESPONSE:",
        response.data
      );

      const data =
        response.data?.quizzes ??
        response.data?.data ??
        [];

      if (!Array.isArray(data)) {
        setQuizzes([]);
        return;
      }

      setQuizzes(data);

    } catch (error: any) {
      console.error(
        "LOAD QUIZZES ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load quizzes."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     DELETE QUIZ
  =================================================== */

  const handleDelete = async (
    quizId: number
  ) => {
    if (!Number.isInteger(quizId)) {
      setError("Invalid quiz ID.");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this quiz?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(quizId);
      setError("");

      await api.delete(
        `/quizzes/${quizId}`
      );

      setQuizzes((current) =>
        current.filter(
          (quiz) =>
            quiz.id !== quizId
        )
      );

    } catch (error: any) {
      console.error(
        "DELETE QUIZ ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete quiz."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ===================================================
     MANAGE QUIZ
  =================================================== */

  const handleManage = (
    quizId: number
  ) => {
    const id = Number(quizId);

    if (!Number.isInteger(id) || id <= 0) {
      setError(
        "Invalid quiz ID."
      );
      return;
    }

    navigate(
      `/teacher/quizzes/${id}`
    );
  };

  /* ===================================================
     EDIT QUIZ
  =================================================== */

  const handleEdit = (
    quizId: number
  ) => {
    const id = Number(quizId);

    if (!Number.isInteger(id) || id <= 0) {
      setError(
        "Invalid quiz ID."
      );
      return;
    }

    navigate(
      `/teacher/quizzes/${id}/edit`
    );
  };

  /* ===================================================
     SEARCH
  =================================================== */

  const searchText =
    search.trim().toLowerCase();

  const filteredQuizzes =
    quizzes.filter((quiz) => {
      return (
        quiz.title
          ?.toLowerCase()
          .includes(searchText) ||

        quiz.lesson?.title
          ?.toLowerCase()
          .includes(searchText) ||

        quiz.lesson?.course?.title
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ClipboardList
                size={27}
              />
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">
              Loading quizzes...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while your quizzes are loaded.
            </p>

          </div>

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

        {/* ============================================
            HEADER
        ============================================ */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <ClipboardList
                  size={27}
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-indigo-600">
                  Teacher Portal
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Quizzes
                </h1>

              </div>

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Create, manage, and edit quizzes for your lessons.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/teacher/quizzes/create"
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />

            Create Quiz
          </button>

        </div>

        {/* ============================================
            ERROR
        ============================================ */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4">

            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-sm font-semibold text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>

          </div>
        )}

        {/* ============================================
            STATS
        ============================================ */}

        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL QUIZZES */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Quizzes
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {quizzes.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ClipboardList
                  size={23}
                />
              </div>

            </div>

          </div>

          {/* TOTAL QUESTIONS */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Questions
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {quizzes.reduce(
                    (total, quiz) =>
                      total +
                      (quiz.questions?.length || 0),
                    0
                  )}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <BookOpen
                  size={23}
                />
              </div>

            </div>

          </div>

          {/* LESSONS WITH QUIZZES */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Quiz Lessons
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {
                    new Set(
                      quizzes.map(
                        (quiz) =>
                          quiz.lessonId
                      )
                    ).size
                  }
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users
                  size={23}
                />
              </div>

            </div>

          </div>

        </div>

        {/* ============================================
            SEARCH
        ============================================ */}

        <div className="mb-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">

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
              placeholder="Search quizzes, lessons, or courses..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white"
            />

          </div>

        </div>

        {/* ============================================
            RESULT COUNT
        ============================================ */}

        <div className="mb-4 flex items-center justify-between">

          <p className="text-sm font-medium text-slate-500">

            {filteredQuizzes.length}

            {" "}

            {filteredQuizzes.length === 1
              ? "quiz"
              : "quizzes"}

            {" "}
            found

          </p>

        </div>

        {/* ============================================
            EMPTY
        ============================================ */}

        {filteredQuizzes.length === 0 ? (

          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

              <ClipboardList
                size={30}
              />

            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No quizzes found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try searching for another quiz."
                : "Create your first quiz to assess your students."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/teacher/quizzes/create"
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={18} />

                Create First Quiz
              </button>
            )}

          </div>

        ) : (

          /* ==========================================
             QUIZ LIST
          ========================================== */

          <div className="grid gap-5 lg:grid-cols-2">

            {filteredQuizzes.map(
              (quiz) => (

                <div
                  key={quiz.id}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  {/* QUIZ HEADER */}

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

                      <ClipboardList
                        size={23}
                      />

                    </div>

                    <div className="min-w-0 flex-1">

                      <h2 className="truncate text-lg font-bold text-slate-900">
                        {quiz.title}
                      </h2>

                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                        <BookOpen
                          size={15}
                        />

                        <span className="truncate">
                          {quiz.lesson?.title ||
                            "Lesson"}
                        </span>

                      </div>

                    </div>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      #{quiz.id}
                    </span>

                  </div>

                  {/* COURSE */}

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Course
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                      {quiz.lesson?.course?.title ||
                        "Course"}
                    </p>

                  </div>

                  {/* INFO */}

                  <div className="mt-5 grid grid-cols-2 gap-4">

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">

                      <p className="text-xs text-slate-400">
                        Questions
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {quiz.questions?.length || 0}
                      </p>

                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-white p-4">

                      <p className="text-xs text-slate-400">
                        Lesson ID
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        #{quiz.lessonId}
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">

                    <button
                      type="button"
                      onClick={() =>
                        handleManage(
                          quiz.id
                        )
                      }
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Manage
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          quiz.id
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      <Edit
                        size={16}
                      />

                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          quiz.id
                        )
                      }
                      disabled={
                        deletingId ===
                        quiz.id
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <Trash2
                        size={16}
                      />

                      {deletingId ===
                      quiz.id
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
  );
}