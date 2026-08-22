import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Loader2,
  PlayCircle,
  Trophy,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface QuizAttempt {
  id: number;
  score: number;
  totalItems: number;
  percentage: number;
  completedAt: string | null;
}

interface Quiz {
  id: number;
  title: string;
  attempts: QuizAttempt[];
}

interface Lesson {
  id: number;
  title: string;
  content: string | null;
  order: number;
  completed: boolean;
  quizzes: Quiz[];
}

interface LessonResponse {
  success: boolean;
  data: {
    courseId: number;
    lesson: Lesson;
  };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function LessonDetails() {
  const navigate = useNavigate();

  const {
    courseId,
    lessonId,
  } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  /* =====================================================
     STATE
  ===================================================== */

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [completing, setCompleting] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD LESSON
  ===================================================== */

  const loadLesson = async () => {
    if (!courseId || !lessonId) {
      setError(
        "Course ID or Lesson ID is missing."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<LessonResponse>(
          `/student/courses/${courseId}/lessons/${lessonId}`
        );

      console.log(
        "LESSON API RESPONSE:",
        response.data
      );

      const loadedLesson =
        response.data?.data?.lesson;

      if (!loadedLesson) {
        throw new Error(
          "Lesson data was not returned by the server."
        );
      }

      setLesson({
        ...loadedLesson,
        quizzes:
          Array.isArray(
            loadedLesson.quizzes
          )
            ? loadedLesson.quizzes
            : [],
      });

    } catch (error: any) {
      console.error(
        "LESSON DETAILS ERROR:",
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
          error.message ||
          "Failed to load lesson."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadLesson();
  }, [courseId, lessonId]);

  /* =====================================================
     COMPLETE LESSON
  ===================================================== */

  const completeLesson = async () => {
    if (
      !courseId ||
      !lessonId ||
      completing ||
      lesson?.completed
    ) {
      return;
    }

    try {
      setCompleting(true);

      setError("");

      await api.post(
        `/student/courses/${courseId}/lessons/${lessonId}/complete`
      );

      setLesson((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          completed: true,
        };
      });

    } catch (error: any) {
      console.error(
        "COMPLETE LESSON ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to complete lesson."
      );

    } finally {
      setCompleting(false);
    }
  };

  /* =====================================================
     TAKE QUIZ
  ===================================================== */

  const handleTakeQuiz = (
    quizId: number
  ) => {
    if (
      !courseId ||
      !lessonId
    ) {
      return;
    }

    navigate(
      `/student/courses/${courseId}/lessons/${lessonId}/quiz/${quizId}`
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <Loader2
            size={32}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading lesson...
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8">

        <h2 className="font-bold text-red-700">
          Unable to load lesson
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <div className="mt-5 flex gap-3">

          <button
            type="button"
            onClick={loadLesson}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/student/courses/${courseId}`
              )
            }
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Back to Course
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     NO LESSON
  ===================================================== */

  if (!lesson) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">

        <BookOpen
          size={35}
          className="mx-auto text-slate-300"
        />

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Lesson not found
        </h2>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/student/courses/${courseId}`
            )
          }
          className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Course
        </button>

      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          navigate(
            `/student/courses/${courseId}`
          )
        }
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={17} />

        Back to Course
      </button>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-8 text-white shadow-lg">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">

              <BookOpen size={25} />

            </div>

            <div>

              <p className="text-sm text-indigo-100">
                Lesson {lesson.order}
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                {lesson.title}
              </h1>

            </div>

          </div>

          {lesson.completed && (
            <div className="flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur sm:self-auto">

              <CheckCircle2 size={17} />

              Completed

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          LESSON CONTENT
      ================================================= */}

      <section className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Lesson Content
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Study the lesson before taking the quiz.
            </p>

          </div>

          {lesson.completed && (
            <span className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">

              <CheckCircle2 size={17} />

              Completed

            </span>
          )}

        </div>

        {/* CONTENT */}

        <div className="mt-7 rounded-2xl bg-slate-50 p-6">

          {lesson.content ? (

            <div className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {lesson.content}
            </div>

          ) : (

            <div className="py-6 text-center">

              <BookOpen
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-400">
                No lesson content available.
              </p>

            </div>

          )}

        </div>

        {/* COMPLETE */}

        <div className="mt-7 flex justify-end">

          {!lesson.completed ? (

            <button
              type="button"
              onClick={completeLesson}
              disabled={completing}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {completing ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />

                  Mark as Complete
                </>
              )}

            </button>

          ) : (

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-600">

              <CheckCircle2 size={18} />

              Lesson Completed

            </div>

          )}

        </div>

      </section>

      {/* =================================================
          QUIZZES
      ================================================= */}

      <section className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Lesson Quizzes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Test what you learned from this lesson.
            </p>

          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

            <Trophy size={19} />

          </div>

        </div>

        {/* NO QUIZZES */}

        {lesson.quizzes.length === 0 ? (

          <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center">

            <BookOpen
              size={30}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-semibold text-slate-800">
              No quiz available
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Your teacher has not added a quiz
              to this lesson yet.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-3">

            {lesson.quizzes.map(
              (quiz) => {

                const lastAttempt =
                  quiz.attempts?.length > 0
                    ? quiz.attempts[0]
                    : null;

                return (
                  <div
                    key={quiz.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-100 hover:bg-indigo-50/40 sm:flex-row sm:items-center sm:justify-between"
                  >

                    {/* QUIZ INFO */}

                    <div className="flex min-w-0 items-center gap-4">

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          lastAttempt
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >

                        {lastAttempt ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-slate-800">
                          {quiz.title}
                        </p>

                        {lastAttempt ? (

                          <p className="mt-1 text-xs text-slate-400">

                            Last score:{" "}

                            <span className="font-semibold text-emerald-600">

                              {lastAttempt.score}
                              /
                              {lastAttempt.totalItems}

                            </span>

                            {" • "}

                            {lastAttempt.percentage}%

                          </p>

                        ) : (

                          <p className="mt-1 text-xs text-slate-400">
                            Not attempted yet
                          </p>

                        )}

                      </div>

                    </div>

                    {/* QUIZ BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        handleTakeQuiz(
                          quiz.id
                        )
                      }
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >

                      <PlayCircle size={17} />

                      {lastAttempt
                        ? "Retake Quiz"
                        : "Take Quiz"}

                    </button>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}