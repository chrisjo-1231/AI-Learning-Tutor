import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}