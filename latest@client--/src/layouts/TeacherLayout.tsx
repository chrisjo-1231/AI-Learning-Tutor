import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";

export default function TeacherLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      <TeacherSidebar />

      <main className="min-h-screen lg:pl-64">
        <Outlet />
      </main>

    </div>
  );
}