import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(
        email,
        password
      );

      switch (user.role) {
        case "STUDENT":
          navigate("/student");
          break;

        case "TEACHER":
          navigate("/teacher");
          break;

        case "ADMIN":
          navigate("/admin");
          break;

        default:
          navigate("/");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="relative hidden overflow-hidden lg:flex">

          {/* Background */}

          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-950" />

          {/* Decorative circles */}

          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-3xl" />

          <div className="absolute left-1/3 top-1/3 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          {/* Content */}

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md">
                <Brain size={26} />
              </div>

              <div>

                <p className="text-lg font-bold text-white">
                  AI Learning Tutor
                </p>

                <p className="text-xs text-indigo-200">
                  Intelligent learning platform
                </p>

              </div>

            </div>

            {/* Hero */}

            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 backdrop-blur-md">

                <Sparkles
                  size={15}
                />

                Smarter learning starts here

              </div>

              <h1 className="text-5xl font-bold leading-tight text-white xl:text-6xl">

                Learn smarter.
                <br />

                <span className="text-indigo-200">
                  Grow faster.
                </span>

              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-indigo-100/80">
                Your personalized AI-powered
                learning companion. Study courses,
                track your progress, and build
                skills at your own pace.
              </p>

              {/* Features */}

              <div className="mt-10 grid gap-4 sm:grid-cols-2">

                <Feature
                  icon={
                    <Brain size={19} />
                  }
                  title="AI-Powered"
                  description="Personalized learning assistance"
                />

                <Feature
                  icon={
                    <BookOpen size={19} />
                  }
                  title="Structured Courses"
                  description="Learn with organized lessons"
                />

                <Feature
                  icon={
                    <ShieldCheck size={19} />
                  }
                  title="Secure Platform"
                  description="Your learning data stays protected"
                />

                <Feature
                  icon={
                    <Sparkles size={19} />
                  }
                  title="Track Progress"
                  description="See your learning growth"
                />

              </div>

            </div>

            {/* Bottom */}

            <div className="text-sm text-indigo-200/60">
              © 2026 AI Learning Tutor
            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile logo */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Brain size={26} />
              </div>

              <div>

                <p className="text-lg font-bold text-slate-900">
                  AI Learning Tutor
                </p>

                <p className="text-xs text-slate-400">
                  Intelligent learning platform
                </p>

              </div>

            </div>

            {/* Login Card */}

            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">

              {/* Heading */}

              <div className="mb-8">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Lock size={22} />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue your
                  learning journey.
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">

                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>

                </div>
              )}

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      required
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* Remember */}

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <span className="text-sm text-slate-500">
                    Remember me
                  </span>

                </label>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>

              {/* Divider */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-slate-100" />

                <span className="text-xs font-medium text-slate-400">
                  New to the platform?
                </span>

                <div className="h-px flex-1 bg-slate-100" />

              </div>

              {/* Register */}

              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Create an account
              </Link>

            </div>

            {/* Footer */}

            <p className="mt-6 text-center text-xs text-slate-400">
              By signing in, you agree to our
              terms and privacy policy.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   FEATURE
===================================================== */

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-100">
        {icon}
      </div>

      <div>

        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-indigo-100/60">
          {description}
        </p>

      </div>

    </div>
  );
}