import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  User,
  Users,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function TeacherSidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/teacher",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "My Courses",
      path: "/teacher/courses",
      icon: BookOpen,
      end: false,
    },
    {
      name: "Students",
      path: "/teacher/students",
      icon: Users,
      end: false,
    },
    {
      name: "Quizzes",
      path: "/teacher/quizzes",
      icon: GraduationCap,
      end: false,
    },
    {
      name: "Profile",
      path: "/teacher/profile",
      icon: User,
      end: false,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

      {/* LOGO */}

      <div className="flex h-20 items-center border-b border-slate-100 px-6">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <BookOpen size={23} />
          </div>

          <div>
            <h1 className="font-bold text-slate-900">
              AI Learning
            </h1>

            <p className="text-xs text-slate-400">
              Teacher Portal
            </p>
          </div>

        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 space-y-2 p-4">

        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `
                flex items-center gap-3 rounded-xl px-4 py-3
                text-sm font-semibold transition
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
                `
              }
            >
              <Icon size={19} />

              <span>
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </nav>

      {/* USER */}

      <div className="border-t border-slate-100 p-4">

        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600">
            {user?.name?.charAt(0).toUpperCase() || "T"}
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name || "Teacher"}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user?.email || "Teacher Account"}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />

          Logout
        </button>

      </div>

    </aside>
  );
}