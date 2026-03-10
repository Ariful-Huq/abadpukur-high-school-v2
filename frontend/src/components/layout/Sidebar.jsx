import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCog,
  CalendarCheck,
  Clock,
  DollarSign,
  Settings
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4">

      <h2 className="text-xl font-bold mb-6">School ERP</h2>

      <nav className="space-y-3">

        <Link to="/" className="flex items-center gap-2 hover:text-blue-400">
          <LayoutDashboard size={18}/> Dashboard
        </Link>

        <Link to="/academics/classes" className="flex items-center gap-2 hover:text-blue-400">
          <GraduationCap size={18}/> Academics
        </Link>

        <Link to="/students" className="flex items-center gap-2 hover:text-blue-400">
          <Users size={18}/> Students
        </Link>

        <Link to="/teachers" className="flex items-center gap-2 hover:text-blue-400">
          <UserCog size={18}/> Teachers
        </Link>

        <Link to="/routine" className="flex items-center gap-2 hover:text-blue-400">
          <Clock size={18}/> Routine
        </Link>

        <Link to="/attendance" className="flex items-center gap-2 hover:text-blue-400">
          <CalendarCheck size={18}/> Attendance
        </Link>

        <Link to="/fees" className="flex items-center gap-2 hover:text-blue-400">
          <DollarSign size={18}/> Fees
        </Link>

        <Link to="/settings" className="flex items-center gap-2 hover:text-blue-400">
          <Settings size={18}/> Settings
        </Link>

      </nav>

    </div>
  );
}