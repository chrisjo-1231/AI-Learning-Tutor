import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

type Role = "STUDENT" | "TEACHER";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<Role>("STUDENT");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!role) {
      setError("Please select your role.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      navigate("/login");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Create Account
          </h1>

          <p className="text-slate-500 mt-2">
            Create your account to get started.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAME */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your full name"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              minLength={6}
              required
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Register as
            </label>

            <div className="grid grid-cols-2 gap-3">

              {/* STUDENT */}
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setRole("STUDENT")
                }
                className={`rounded-xl border-2 p-4 text-center transition ${
                  role === "STUDENT"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                <div className="text-2xl mb-1">
                  🎓
                </div>

                <div className="font-semibold">
                  Student
                </div>

                <div className="text-xs mt-1 text-slate-400">
                  Learn courses
                </div>
              </button>

              {/* TEACHER */}
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setRole("TEACHER")
                }
                className={`rounded-xl border-2 p-4 text-center transition ${
                  role === "TEACHER"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                <div className="text-2xl mb-1">
                  👨‍🏫
                </div>

                <div className="font-semibold">
                  Teacher
                </div>

                <div className="text-xs mt-1 text-slate-400">
                  Create courses
                </div>
              </button>

            </div>
          </div>

          {/* SELECTED ROLE */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-sm text-slate-600">
              Selected role:
              <span className="font-bold text-slate-900 ml-1">
                {role === "STUDENT"
                  ? "Student"
                  : "Teacher"}
              </span>
            </p>
          </div>

          {/* REGISTER */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl py-3 font-semibold transition"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* LOGIN */}
        <p className="text-sm text-center mt-6 text-slate-500">
          Already have an account?{" "}

          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}