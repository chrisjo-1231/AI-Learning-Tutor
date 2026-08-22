import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Send,
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

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface Lesson {
  id: number;
  title: string;
}

interface Quiz {
  id: number;
  title: string;
  lesson: Lesson;
  questions: Question[];
}

interface QuizResponse {
  success: boolean;
  quiz: Quiz;
}

interface QuizResult {
  attempt?: {
    id: number;
    studentId: number;
    quizId: number;
    score: number;
    totalItems: number;
    completedAt: string;
  };

  quizId: number;
  score: number;
  totalItems: number;
  percentage: number;
}

interface SubmitResponse {
  success: boolean;
  message: string;
  result: QuizResult;
}

/* =====================================================
   MAIN
===================================================== */

export default function QuizDetails() {
  const navigate = useNavigate();

  const {
    quizId,
  } = useParams<{
    quizId: string;
  }>();

  const [quiz, setQuiz] =
    useState<Quiz | null>(null);

  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<QuizResult | null>(null);

  /* =====================================================
     LOAD QUIZ
  ===================================================== */

  useEffect(() => {
    if (!quizId) {
      setError("Quiz ID is missing.");
      setLoading(false);
      return;
    }

    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      if (!quizId) {
        throw new Error(
          "Quiz ID is missing."
        );
      }

      console.log(
        "LOADING STUDENT QUIZ:",
        quizId
      );

      /*
       * IMPORTANT:
       *
       * Student must NOT use:
       *
       * GET /quizzes/:id
       *
       * because that endpoint is TEACHER only.
       *
       * Student uses:
       *
       * GET /quizzes/student/:id
       */

      const response =
        await api.get<QuizResponse>(
          `/quizzes/student/${quizId}`
        );

      console.log(
        "STUDENT QUIZ RESPONSE:",
        response.data
      );

      if (!response.data?.quiz) {
        throw new Error(
          "Quiz data was not returned."
        );
      }

      setQuiz(
        response.data.quiz
      );

    } catch (error: any) {
      console.error(
        "LOAD QUIZ ERROR:",
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
          "Failed to load quiz."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SELECT ANSWER
  ===================================================== */

  const selectAnswer = (
    questionId: number,
    answer: string
  ) => {
    if (submitting) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));

    setError("");
  };

  /* =====================================================
     SUBMIT QUIZ
  ===================================================== */

  const submitQuiz = async () => {
    if (!quiz || submitting) {
      return;
    }

    /* -----------------------------------------------
       CHECK UNANSWERED QUESTIONS
    ----------------------------------------------- */

    const unanswered =
      quiz.questions.filter(
        (question) =>
          !answers[question.id]
      );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. ${unanswered.length} question(s) remaining.`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /* ---------------------------------------------
         FORMAT ANSWERS
      --------------------------------------------- */

      const formattedAnswers =
        quiz.questions.map(
          (question) => ({
            questionId: question.id,
            answer:
              answers[question.id],
          })
        );

      console.log(
        "SUBMITTING QUIZ:",
        {
          quizId: quiz.id,
          answers: formattedAnswers,
        }
      );

      /* ---------------------------------------------
         SUBMIT
      --------------------------------------------- */

      const response =
        await api.post<SubmitResponse>(
          `/quizzes/${quiz.id}/submit`,
          {
            answers:
              formattedAnswers,
          }
        );

      console.log(
        "QUIZ SUBMIT RESPONSE:",
        response.data
      );

      if (!response.data?.result) {
        throw new Error(
          "Quiz result was not returned."
        );
      }

      setResult(
        response.data.result
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error: any) {
      console.error(
        "SUBMIT QUIZ ERROR:",
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
          "Failed to submit quiz."
      );

    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     BACK TO LESSON
  ===================================================== */

  const backToLesson = () => {
    navigate(-1);
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading quiz...
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error && !quiz) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8">

        <h2 className="font-bold text-red-700">
          Unable to load quiz
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <div className="mt-5 flex gap-3">

          <button
            type="button"
            onClick={loadQuiz}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={backToLesson}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Back to Lesson
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     NO QUIZ
  ===================================================== */

  if (!quiz) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">

        <Trophy
          size={40}
          className="mx-auto text-slate-300"
        />

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Quiz not found
        </h2>

        <button
          type="button"
          onClick={backToLesson}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <ArrowLeft size={17} />
          Back to Lesson
        </button>

      </div>
    );
  }

  /* =====================================================
     RESULT
  ===================================================== */

  if (result) {
    return (
      <QuizResultCard
        quiz={quiz}
        result={result}
        onBack={backToLesson}
      />
    );
  }

  /* =====================================================
     QUIZ PAGE
  ===================================================== */

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        onClick={backToLesson}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to Lesson
      </button>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-lg">

        <div className="flex items-start justify-between gap-5">

          <div>

            <p className="text-sm font-medium text-indigo-100">
              Lesson Quiz
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {quiz.title}
            </h1>

            <p className="mt-2 text-sm text-indigo-100">
              {quiz.questions.length}{" "}
              {quiz.questions.length === 1
                ? "question"
                : "questions"}
            </p>

          </div>

          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-white/15 sm:flex">

            <Trophy size={28} />

          </div>

        </div>

      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">

          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

        </div>
      )}

      {/* =================================================
          QUESTIONS
      ================================================= */}

      <div className="space-y-5">

        {quiz.questions.length === 0 ? (

          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">

            <Trophy
              size={40}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No questions available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              This quiz does not have any questions yet.
            </p>

            <button
              type="button"
              onClick={backToLesson}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <ArrowLeft size={17} />
              Back to Lesson
            </button>

          </div>

        ) : (

          quiz.questions.map(
            (question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                number={index + 1}
                selectedAnswer={
                  answers[question.id]
                }
                onSelect={(answer) =>
                  selectAnswer(
                    question.id,
                    answer
                  )
                }
              />
            )
          )

        )}

      </div>

      {/* =================================================
          SUBMIT
      ================================================= */}

      {quiz.questions.length > 0 && (
        <section className="sticky bottom-4 rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-xl backdrop-blur">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-slate-900">
                Quiz Progress
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {Object.keys(answers).length}{" "}
                /{" "}
                {quiz.questions.length}{" "}
                answered
              </p>

            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={submitQuiz}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                  Submitting...
                </>
              ) : (
                <>
                  <Send size={17} />

                  Submit Quiz
                </>
              )}

            </button>

          </div>

        </section>
      )}

    </div>
  );
}

/* =====================================================
   QUESTION CARD
===================================================== */

function QuestionCard({
  question,
  number,
  selectedAnswer,
  onSelect,
}: {
  question: Question;
  number: number;
  selectedAnswer?: string;
  onSelect: (
    answer: string
  ) => void;
}) {
  const options = [
    {
      key: "A",
      text: question.optionA,
    },
    {
      key: "B",
      text: question.optionB,
    },
    {
      key: "C",
      text: question.optionC,
    },
    {
      key: "D",
      text: question.optionD,
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

      <div className="flex gap-4">

        {/* NUMBER */}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">
          {number}
        </div>

        {/* QUESTION */}

        <div className="min-w-0 flex-1">

          <h2 className="text-lg font-bold leading-7 text-slate-900">
            {question.questionText}
          </h2>

          {/* OPTIONS */}

          <div className="mt-5 space-y-3">

            {options.map(
              (option) => {

                const selected =
                  selectedAnswer ===
                  option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() =>
                      onSelect(
                        option.key
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50"
                    }`}
                  >

                    {/* OPTION LETTER */}

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-500 ring-1 ring-slate-200"
                      }`}
                    >

                      {selected ? (
                        <CheckCircle2
                          size={18}
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {option.key}
                        </span>
                      )}

                    </div>

                    {/* OPTION TEXT */}

                    <span
                      className={`text-sm font-medium ${
                        selected
                          ? "text-indigo-700"
                          : "text-slate-700"
                      }`}
                    >
                      {option.text}
                    </span>

                  </button>
                );
              }
            )}

          </div>

        </div>

      </div>

    </section>
  );
}

/* =====================================================
   RESULT CARD
===================================================== */

function QuizResultCard({
  quiz,
  result,
  onBack,
}: {
  quiz: Quiz;
  result: QuizResult;
  onBack: () => void;
}) {
  const percentage =
    Math.round(
      Math.min(
        100,
        Math.max(
          0,
          result.percentage
        )
      )
    );

  const passed =
    percentage >= 75;

  return (
    <div className="mx-auto max-w-2xl">

      <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">

        {/* RESULT ICON */}

        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${
            passed
              ? "bg-emerald-100 text-emerald-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >

          {passed ? (
            <CheckCircle2 size={40} />
          ) : (
            <Clock3 size={40} />
          )}

        </div>

        {/* TITLE */}

        <p className="mt-6 text-sm font-semibold text-indigo-600">
          Quiz Completed
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {quiz.title}
        </h1>

        {/* SCORE */}

        <div className="mt-8 rounded-3xl bg-slate-50 p-8">

          <p className="text-6xl font-bold text-indigo-600">
            {percentage}%
          </p>

          <p className="mt-3 text-sm text-slate-500">

            You scored{" "}

            <span className="font-bold text-slate-700">
              {result.score}
            </span>

            {" "}out of{" "}

            <span className="font-bold text-slate-700">
              {result.totalItems}
            </span>

          </p>

        </div>

        {/* MESSAGE */}

        <div className="mt-6">

          <p
            className={`text-lg font-bold ${
              passed
                ? "text-emerald-600"
                : "text-orange-600"
            }`}
          >

            {passed
              ? "Great job! 🎉"
              : "Keep learning and try again!"}

          </p>

          <p className="mt-2 text-sm text-slate-400">
            Your quiz attempt has been recorded.
          </p>

        </div>

        {/* BACK */}

        <button
          type="button"
          onClick={onBack}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >

          <ArrowLeft size={17} />

          Back to Lesson

        </button>

      </div>

    </div>
  );
}