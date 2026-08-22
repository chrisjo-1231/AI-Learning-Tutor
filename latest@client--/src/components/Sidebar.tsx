import {
  BookOpen,
  BrainCircuit,
  ChartNoAxesColumn,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
  ClipboardList,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface Props {
  role:
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";
}

export default function Sidebar({
  role,
}: Props) {
  const {
    logout,
    user,
  } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const studentLinks = [
    {
      label: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
    },
    {
      label: "My Courses",
      path: "/student/courses",
      icon: BookOpen,
    },
    {
      label: "Progress",
      path: "/student/progress",
      icon: ChartNoAxesColumn,
    },
    {
      label: "AI Tutor",
      path: "/student/ai-tutor",
      icon: BrainCircuit,
    },
  ];

  const teacherLinks = [
    {
      label: "Dashboard",
      path: "/teacher",
      icon: LayoutDashboard,
    },
    {
      label: "My Courses",
      path: "/teacher/courses",
      icon: BookOpen,
    },
    {
      label: "Students",
      path: "/teacher/students",
      icon: Users,
    },
    {
      label: "Quizzes",
      path: "/teacher/quizzes",
      icon: ClipboardList,
    },
  ];

  const adminLinks = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
  ];

  const links =
    role === "STUDENT"
      ? studentLinks
      : role === "TEACHER"
      ? teacherLinks
      : adminLinks;

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap size={22} />
          </div>

          <div>
            <h1 className="font-bold">
              AI Learning
            </h1>
            <p className="text-xs text-slate-400">
              Tutor
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-slate-800">
        <p className="text-sm font-medium">
          {user?.name}
        </p>

        <p className="text-xs text-slate-400">
          {user?.role}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === `/${role.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-900 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}