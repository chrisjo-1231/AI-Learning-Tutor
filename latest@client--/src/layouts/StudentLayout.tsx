import {
  BookOpen,
  Bot,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function StudentLayout() {
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
      path: "/student",
      icon: LayoutDashboard,
    },
    {
    name: "Browse Courses",
    path: "/student/browse-courses",
    icon: BookOpen,
  },
    {
      name: "My Courses",
      path: "/student/courses",
      icon: BookOpen,
    },
      {
    name: "AI Tutor",
    path: "/student/ai-tutor",
    icon: Bot,
    end: false,
  },
    {
  name: "Profile",
  path: "/student/profile",
  icon: User,

    },
    
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          SIDEBAR
      ================================================= */}

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
                Student Portal
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
                end={item.path === "/student"}
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
              {user?.name?.charAt(0).toUpperCase() || "S"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "Student"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email || "Student Account"}
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

      {/* =================================================
          MOBILE TOPBAR
      ================================================= */}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BookOpen size={19} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              AI Learning
            </p>

            <p className="text-[10px] text-slate-400">
              Student Portal
            </p>
          </div>

        </div>

      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="lg:pl-64">

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

          <Outlet />

        </div>

      </main>

    </div>
  );
}