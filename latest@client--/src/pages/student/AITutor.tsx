import {
  Bot,
  BookOpen,
  ChevronDown,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

interface Course {
  id: number;
  title: string;
}

interface Lesson {
  id: number;
  title: string;
  courseId: number;
}

interface Message {
  id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: number;
    title: string;
  } | null;
  lesson?: {
    id: number;
    title: string;
  } | null;
  messages: Message[];
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AITutor() {
  /* ===================================================
     STATE
  =================================================== */

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [selectedCourseId, setSelectedCourseId] =
    useState<number | "">("");

  const [selectedLessonId, setSelectedLessonId] =
    useState<number | "">("");

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadingConversation, setLoadingConversation] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /* ===================================================
     LOAD CONVERSATIONS
  =================================================== */

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/ai/conversations"
        );

      const data =
        response.data?.data || [];

      setConversations(data);

    } catch (error: any) {
      console.error(
        "LOAD AI CONVERSATIONS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load AI conversations."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     LOAD COURSES
  =================================================== */

  const loadCourses = async () => {
    try {
      const response =
        await api.get("/courses");

      const data =
        response.data?.data ||
        response.data?.courses ||
        [];

      setCourses(data);

    } catch (error) {
      console.error(
        "LOAD AI COURSES ERROR:",
        error
      );
    }
  };

  /* ===================================================
     LOAD LESSONS
  =================================================== */

  const loadLessons = async (
    courseId: number
  ) => {
    try {
      setLessons([]);

      setSelectedLessonId("");

      const response =
        await api.get(
          `/lessons/course/${courseId}`
        );

      const data =
        response.data?.data ||
        response.data?.lessons ||
        [];

      setLessons(data);

    } catch (error) {
      console.error(
        "LOAD AI LESSONS ERROR:",
        error
      );

      setLessons([]);
    }
  };

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    loadConversations();
    loadCourses();
  }, []);

  /* ===================================================
     SCROLL TO BOTTOM
  =================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    activeConversation?.messages,
    sending,
  ]);

  /* ===================================================
     COURSE CHANGE
  =================================================== */

  const handleCourseChange = (
    value: string
  ) => {
    if (!value) {
      setSelectedCourseId("");
      setSelectedLessonId("");
      setLessons([]);

      return;
    }

    const courseId =
      Number(value);

    setSelectedCourseId(courseId);

    loadLessons(courseId);
  };

  /* ===================================================
     NEW CHAT
  =================================================== */

  const handleNewChat = () => {
    setActiveConversation(null);

    setQuestion("");

    setError("");

    setSelectedCourseId("");

    setSelectedLessonId("");

    setLessons([]);
  };

  /* ===================================================
     OPEN CONVERSATION
  =================================================== */

  const openConversation = async (
    conversationId: number
  ) => {
    try {
      setLoadingConversation(true);
      setError("");

      const response =
        await api.get(
          `/ai/conversations/${conversationId}`
        );

      const conversation =
        response.data?.data;

      if (!conversation) {
        throw new Error(
          "Conversation not found."
        );
      }

      setActiveConversation(
        conversation
      );

      /* -----------------------------------------------
         RESTORE COURSE
      ------------------------------------------------ */

      if (conversation.course?.id) {
        setSelectedCourseId(
          conversation.course.id
        );

        await loadLessons(
          conversation.course.id
        );
      } else {
        setSelectedCourseId("");
        setLessons([]);
      }

      /* -----------------------------------------------
         RESTORE LESSON
      ------------------------------------------------ */

      if (conversation.lesson?.id) {
        setSelectedLessonId(
          conversation.lesson.id
        );
      } else {
        setSelectedLessonId("");
      }

    } catch (error: any) {
      console.error(
        "OPEN AI CONVERSATION ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load conversation."
      );
    } finally {
      setLoadingConversation(false);
    }
  };

  /* ===================================================
     SEND MESSAGE
  =================================================== */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response =
        await api.post(
          "/ai/ask",
          {
            question:
              trimmedQuestion,

            courseId:
              selectedCourseId ||
              undefined,

            lessonId:
              selectedLessonId ||
              undefined,

            conversationId:
              activeConversation?.id ||
              undefined,
          }
        );

      const result =
        response.data?.data;

      if (!result) {
        throw new Error(
          "AI response was not returned."
        );
      }

      const userMessage: Message = {
        id:
          Date.now(),

        role: "USER",

        content:
          trimmedQuestion,

        createdAt:
          new Date().toISOString(),
      };

      const assistantMessage =
        result.message;

      /* -----------------------------------------------
         UPDATE ACTIVE CHAT
      ------------------------------------------------ */

      if (activeConversation) {
        setActiveConversation({
          ...activeConversation,

          messages: [
            ...activeConversation.messages,

            userMessage,

            assistantMessage,
          ],

          updatedAt:
            new Date().toISOString(),
        });

      } else {
        const newConversation:
          Conversation = {
            id:
              result.conversationId,

            title:
              trimmedQuestion.substring(
                0,
                100
              ),

            createdAt:
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString(),

            course:
              result.course,

            lesson:
              result.lesson,

            messages: [
              userMessage,

              assistantMessage,
            ],
          };

        setActiveConversation(
          newConversation
        );
      }

      setQuestion("");

      /* -----------------------------------------------
         REFRESH SIDEBAR
      ------------------------------------------------ */

      await loadConversations();

    } catch (error: any) {
      console.error(
        "SEND AI MESSAGE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to get AI response."
      );
    } finally {
      setSending(false);
    }
  };

  /* ===================================================
     FORMAT MESSAGE
  =================================================== */

  const formatMessage = (
    content: string
  ) => {
    return content
      .split("\n")
      .map(
        (line, index) => (
          <span key={index}>
            {line}

            {index <
              content.split("\n").length -
                1 && (
              <br />
            )}
          </span>
        )
      );
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">

          <Loader2
            size={34}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading AI Tutor...
          </p>

        </div>
      </div>
    );
  }

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <div className="flex h-[calc(100vh-0px)] min-h-[650px] overflow-hidden bg-slate-50">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">

        {/* SIDEBAR HEADER */}

        <div className="border-b border-slate-100 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Sparkles size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                AI Tutor
              </h2>

              <p className="text-xs text-slate-400">
                Learning Assistant
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={18} />

            New Chat
          </button>

        </div>

        {/* CONVERSATIONS */}

        <div className="flex-1 overflow-y-auto p-3">

          <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Recent Conversations
          </p>

          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center">

              <MessageCircle
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-xs text-slate-400">
                No conversations yet.
              </p>

            </div>
          ) : (
            <div className="space-y-1">

              {conversations.map(
                (conversation) => (
                  <button
                    key={
                      conversation.id
                    }
                    type="button"
                    onClick={() =>
                      openConversation(
                        conversation.id
                      )
                    }
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      activeConversation?.id ===
                      conversation.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <MessageCircle
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold">
                          {conversation.title ||
                            "New Conversation"}
                        </p>

                        {conversation.course && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {
                              conversation
                                .course
                                .title
                            }
                          </p>
                        )}

                      </div>

                    </div>

                  </button>
                )
              )}

            </div>
          )}

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}

        <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Bot size={21} />
              </div>

              <div>

                <h1 className="font-bold text-slate-900">
                  AI Learning Tutor
                </h1>

                <p className="text-xs text-slate-400">
                  Ask questions and deepen your understanding.
                </p>

              </div>

            </div>

            {/* MOBILE NEW CHAT */}

            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 md:hidden"
            >
              <Plus size={17} />

              New
            </button>

          </div>

        </header>

        {/* =================================================
            CONTEXT SELECTOR
        ================================================= */}

        <div className="border-b border-slate-100 bg-white px-5 py-4 sm:px-7">

          <div className="grid gap-3 sm:grid-cols-2">

            {/* COURSE */}

            <div>

              <label
                htmlFor="ai-course"
                className="mb-1.5 block text-xs font-semibold text-slate-500"
              >
                Course Context
              </label>

              <div className="relative">

                <BookOpen
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="ai-course"
                  value={
                    selectedCourseId
                  }
                  onChange={(e) =>
                    handleCourseChange(
                      e.target.value
                    )
                  }
                  disabled={sending}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white disabled:opacity-60"
                >

                  <option value="">
                    General Learning
                  </option>

                  {courses.map(
                    (course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

            </div>

            {/* LESSON */}

            <div>

              <label
                htmlFor="ai-lesson"
                className="mb-1.5 block text-xs font-semibold text-slate-500"
              >
                Lesson Context
              </label>

              <div className="relative">

                <BookOpen
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="ai-lesson"
                  value={
                    selectedLessonId
                  }
                  onChange={(e) =>
                    setSelectedLessonId(
                      e.target.value
                        ? Number(
                            e.target.value
                          )
                        : ""
                    )
                  }
                  disabled={
                    !selectedCourseId ||
                    sending
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <option value="">
                    All Lessons
                  </option>

                  {lessons.map(
                    (lesson) => (
                      <option
                        key={lesson.id}
                        value={lesson.id}
                      >
                        {lesson.title}
                      </option>
                    )
                  )}

                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 sm:px-7">
            {error}
          </div>
        )}

        {/* =================================================
            CHAT AREA
        ================================================= */}

        <div className="flex-1 overflow-y-auto">

          <div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">

            {loadingConversation ? (
              <div className="flex min-h-[400px] items-center justify-center">

                <Loader2
                  size={30}
                  className="animate-spin text-indigo-600"
                />

              </div>
            ) : !activeConversation ||
              activeConversation.messages.length ===
                0 ? (

              /* =================================================
                 EMPTY STATE
              ================================================= */

              <div className="flex min-h-[450px] flex-col items-center justify-center text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">

                  <Sparkles
                    size={36}
                  />

                </div>

                <h2 className="mt-6 text-2xl font-bold text-slate-900">
                  How can I help you learn?
                </h2>

                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Ask me to explain a concept,
                  summarize a lesson, give you
                  examples, or guide you through
                  a difficult problem.
                </p>

                <div className="mt-7 grid w-full max-w-2xl gap-3 sm:grid-cols-3">

                  {[
                    "Explain this topic simply",
                    "Give me an example",
                    "Help me understand this lesson",
                  ].map(
                    (suggestion) => (
                      <button
                        key={
                          suggestion
                        }
                        type="button"
                        onClick={() =>
                          setQuestion(
                            suggestion
                          )
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        {suggestion}
                      </button>
                    )
                  )}

                </div>

              </div>

            ) : (

              /* =================================================
                 MESSAGES
              ================================================= */

              <div className="space-y-7">

                {activeConversation.messages.map(
                  (message) => (
                    <div
                      key={
                        message.id
                      }
                      className={`flex gap-3 ${
                        message.role ===
                        "USER"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {/* AI ICON */}

                      {message.role ===
                        "ASSISTANT" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                          <Bot
                            size={18}
                          />
                        </div>
                      )}

                      {/* MESSAGE */}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm ${
                          message.role ===
                          "USER"
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md border border-slate-100 bg-white text-slate-700"
                        }`}
                      >
                        {formatMessage(
                          message.content
                        )}
                      </div>

                      {/* USER ICON */}

                      {message.role ===
                        "USER" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                          <User
                            size={18}
                          />
                        </div>
                      )}

                    </div>
                  )
                )}

                {/* =================================================
                   AI THINKING
                ================================================= */}

                {sending && (
                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Bot size={18} />
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">

                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      AI Tutor is thinking...

                    </div>

                  </div>
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">

          <form
            onSubmit={
              handleSubmit
            }
            className="mx-auto max-w-4xl"
          >

            <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-indigo-400 focus-within:bg-white">

              <textarea
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                      "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();

                    if (
                      question.trim() &&
                      !sending
                    ) {
                      e.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                rows={1}
                placeholder="Ask your AI Tutor..."
                disabled={sending}
                className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !question.trim()
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {sending ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Send
                    size={19}
                  />
                )}

              </button>

            </div>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              AI Tutor can make mistakes. Use it as a learning assistant and verify important information.
            </p>

          </form>

        </div>

      </main>

    </div>
  );
}