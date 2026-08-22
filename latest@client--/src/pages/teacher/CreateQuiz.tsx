import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  Plus,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface Lesson {
  id: number;
  title: string;
  courseId: number;

  course?: {
    id: number;
    title: string;
  };
}

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface CreateQuizResponse {
  success: boolean;
  message: string;
  quiz?: {
    id: number;
    title: string;
    lessonId: number;
    questions: Question[];
  };
}

/* =====================================================
   EMPTY QUESTION
===================================================== */

const emptyQuestion = (
  id: number
): Question => ({
  id,
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
});

/* =====================================================
   COMPONENT
===================================================== */

export default function CreateQuiz() {
  const navigate = useNavigate();

  /* ===================================================
     STATE
  =================================================== */

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [lessonId, setLessonId] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [questions, setQuestions] =
    useState<Question[]>([
      emptyQuestion(1),
    ]);

  const [loadingLessons, setLoadingLessons] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ===================================================
     LOAD LESSONS
  =================================================== */

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoadingLessons(true);
      setError("");

      /*
       * Get teacher courses
       */
      const coursesResponse =
        await api.get("/courses");

      const courses =
        coursesResponse.data?.courses ??
        coursesResponse.data?.data ??
        [];

      if (!Array.isArray(courses)) {
        throw new Error(
          "Invalid courses response."
        );
      }

      /*
       * Get lessons from every course
       */
      const lessonResults =
        await Promise.all(
          courses.map(
            async (course: any) => {
              try {
                const response =
                  await api.get(
                    `/lessons/course/${course.id}`
                  );

                const courseLessons =
                  response.data?.lessons ??
                  response.data?.data ??
                  [];

                if (
                  !Array.isArray(
                    courseLessons
                  )
                ) {
                  return [];
                }

                return courseLessons.map(
                  (lesson: any) => ({
                    id: lesson.id,
                    title: lesson.title,
                    courseId: course.id,

                    course: {
                      id: course.id,
                      title: course.title,
                    },
                  })
                );
              } catch (error) {
                console.error(
                  `Failed loading lessons for course ${course.id}`,
                  error
                );

                return [];
              }
            }
          )
        );

      /*
       * Combine all lessons
       */
      const allLessons =
        lessonResults.flat();

      setLessons(allLessons);
    } catch (error: any) {
      console.error(
        "LOAD QUIZ LESSONS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load lessons."
      );
    } finally {
      setLoadingLessons(false);
    }
  };

  /* ===================================================
     UPDATE QUESTION
  =================================================== */

  const updateQuestion = (
    id: number,
    field: keyof Question,
    value: string
  ) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  };

  /* ===================================================
     ADD QUESTION
  =================================================== */

  const addQuestion = () => {
    const nextId =
      questions.length === 0
        ? 1
        : Math.max(
            ...questions.map(
              (question) =>
                question.id
            )
          ) + 1;

    setQuestions((current) => [
      ...current,
      emptyQuestion(nextId),
    ]);

    setError("");
  };

  /* ===================================================
     REMOVE QUESTION
  =================================================== */

  const removeQuestion = (
    id: number
  ) => {
    if (questions.length <= 1) {
      setError(
        "A quiz must have at least one question."
      );

      return;
    }

    setQuestions((current) =>
      current.filter(
        (question) =>
          question.id !== id
      )
    );

    setError("");
  };

  /* ===================================================
     VALIDATE FORM
  =================================================== */

  const validateForm = () => {
    if (!lessonId) {
      setError(
        "Please select a lesson."
      );

      return false;
    }

    if (!title.trim()) {
      setError(
        "Quiz title is required."
      );

      return false;
    }

    if (questions.length === 0) {
      setError(
        "Please add at least one question."
      );

      return false;
    }

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {
      const question =
        questions[i];

      if (
        !question.questionText.trim()
      ) {
        setError(
          `Question ${i + 1} is required.`
        );

        return false;
      }

      if (!question.optionA.trim()) {
        setError(
          `Option A for Question ${
            i + 1
          } is required.`
        );

        return false;
      }

      if (!question.optionB.trim()) {
        setError(
          `Option B for Question ${
            i + 1
          } is required.`
        );

        return false;
      }

      if (!question.optionC.trim()) {
        setError(
          `Option C for Question ${
            i + 1
          } is required.`
        );

        return false;
      }

      if (!question.optionD.trim()) {
        setError(
          `Option D for Question ${
            i + 1
          } is required.`
        );

        return false;
      }

      if (!question.correctAnswer) {
        setError(
          `Please select the correct answer for Question ${
            i + 1
          }.`
        );

        return false;
      }

      /*
       * Make sure correct answer is valid
       */
      if (
        !["A", "B", "C", "D"].includes(
          question.correctAnswer
        )
      ) {
        setError(
          `Invalid correct answer for Question ${
            i + 1
          }.`
        );

        return false;
      }
    }

    return true;
  };

  /* ===================================================
     CREATE QUIZ
  =================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Validate before sending
     */
    if (!validateForm()) {
      return;
    }

    /*
     * Prepare API payload
     */
    const payload = {
      title: title.trim(),

      lessonId: Number(
        lessonId
      ),

      questions:
        questions.map(
          (question) => ({
            questionText:
              question.questionText.trim(),

            optionA:
              question.optionA.trim(),

            optionB:
              question.optionB.trim(),

            optionC:
              question.optionC.trim(),

            optionD:
              question.optionD.trim(),

            correctAnswer:
              question.correctAnswer,
          })
        ),
    };

    console.log(
      "CREATE QUIZ PAYLOAD:",
      payload
    );

    try {
      setLoading(true);

      /*
       * ACTUAL BACKEND REQUEST
       *
       * POST /api/quizzes
       */
      const response =
        await api.post<CreateQuizResponse>(
          "/quizzes",
          payload
        );

      console.log(
        "CREATE QUIZ RESPONSE:",
        response.data
      );

      if (
        !response.data?.success
      ) {
        throw new Error(
          response.data?.message ||
            "Failed to create quiz."
        );
      }

      /*
       * Success message
       */
      setSuccess(
        response.data.message ||
          "Quiz created successfully."
      );

      /*
       * Redirect after successful save
       */
      setTimeout(() => {
        navigate(
          "/teacher/quizzes"
        );
      }, 700);
    } catch (error: any) {
      console.error(
        "CREATE QUIZ ERROR:",
        error
      );

      console.error(
        "CREATE QUIZ RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     LOADING LESSONS
  =================================================== */

  if (loadingLessons) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ClipboardList size={24} />
          </div>

          <p className="font-semibold text-slate-900">
            Loading quiz creator...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Loading available lessons.
          </p>

        </div>
      </div>
    );
  }

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

      <div className="mx-auto max-w-5xl">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/teacher/quizzes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />

          Back to Quizzes
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <ClipboardList size={27} />
          </div>

          <div>

            <p className="text-sm font-semibold text-indigo-600">
              Teacher
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Create Quiz
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a quiz for your students.
            </p>

          </div>

        </div>

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
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
        >

          {/* =================================================
              QUIZ DETAILS
          ================================================= */}

          <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen size={20} />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Quiz Details
                </h2>

                <p className="text-sm text-slate-500">
                  Basic information
                </p>

              </div>

            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Quiz Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. JavaScript Basics Quiz"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
              />

            </div>

            {/* =================================================
                LESSON
            ================================================= */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Lesson
              </label>

              <select
                value={lessonId}
                onChange={(event) =>
                  setLessonId(
                    event.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
              >

                <option value="">
                  Select a lesson
                </option>

                {lessons.map(
                  (lesson) => (
                    <option
                      key={lesson.id}
                      value={lesson.id}
                    >
                      {lesson.course?.title
                        ? `${lesson.course.title} - `
                        : ""}
                      {lesson.title}
                    </option>
                  )
                )}

              </select>

              {lessons.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  No lessons available.
                  Create a lesson first.
                </p>
              )}

            </div>

          </div>

          {/* =================================================
              QUESTIONS
          ================================================= */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

            {/* QUESTIONS HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Questions
                </h2>

                <p className="text-sm text-slate-500">
                  {questions.length} question
                  {questions.length !== 1
                    ? "s"
                    : ""}
                </p>

              </div>

              <button
                type="button"
                onClick={addQuestion}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} />

                Add Question
              </button>

            </div>

            {/* QUESTION LIST */}

            <div className="space-y-6">

              {questions.map(
                (
                  question,
                  index
                ) => (
                  <div
                    key={question.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >

                    {/* QUESTION HEADER */}

                    <div className="mb-5 flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                          {index + 1}
                        </div>

                        <h3 className="font-bold text-slate-900">
                          Question{" "}
                          {index + 1}
                        </h3>

                      </div>

                      {questions.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              question.id
                            )
                          }
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2
                            size={16}
                          />

                          Remove
                        </button>
                      )}

                    </div>

                    {/* QUESTION TEXT */}

                    <div className="mb-5">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Question
                      </label>

                      <textarea
                        value={
                          question.questionText
                        }
                        onChange={(event) =>
                          updateQuestion(
                            question.id,
                            "questionText",
                            event.target.value
                          )
                        }
                        placeholder="Enter your question..."
                        rows={3}
                        disabled={loading}
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500"
                      />

                    </div>

                    {/* OPTIONS */}

                    <div className="grid gap-4 md:grid-cols-2">

                      {(
                        [
                          [
                            "A",
                            "optionA",
                          ],
                          [
                            "B",
                            "optionB",
                          ],
                          [
                            "C",
                            "optionC",
                          ],
                          [
                            "D",
                            "optionD",
                          ],
                        ] as const
                      ).map(
                        ([
                          letter,
                          field,
                        ]) => (
                          <div
                            key={
                              letter
                            }
                          >

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Option{" "}
                              {letter}
                            </label>

                            <input
                              type="text"
                              value={
                                question[
                                  field
                                ]
                              }
                              onChange={(
                                event
                              ) =>
                                updateQuestion(
                                  question.id,
                                  field,
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder={`Enter option ${letter}`}
                              disabled={
                                loading
                              }
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                            />

                          </div>
                        )
                      )}

                    </div>

                    {/* CORRECT ANSWER */}

                    <div className="mt-6">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Correct Answer
                      </label>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                        {[
                          "A",
                          "B",
                          "C",
                          "D",
                        ].map(
                          (answer) => (
                            <button
                              key={
                                answer
                              }
                              type="button"
                              onClick={() =>
                                updateQuestion(
                                  question.id,
                                  "correctAnswer",
                                  answer
                                )
                              }
                              disabled={
                                loading
                              }
                              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                question.correctAnswer ===
                                answer
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >

                              {question.correctAnswer ===
                                answer && (
                                <Check
                                  size={
                                    16
                                  }
                                />
                              )}

                              Option{" "}
                              {answer}

                            </button>
                          )
                        )}

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

            {/* =================================================
                ADD ANOTHER QUESTION
            ================================================= */}

            <button
              type="button"
              onClick={addQuestion}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-semibold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />

              Add Another Question
            </button>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-6 flex justify-end gap-3">

            <Link
              to="/teacher/quizzes"
              className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Create Quiz
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}