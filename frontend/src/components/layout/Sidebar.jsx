import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  Clipboard,
  CreditCard,
  UserCheck,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: <Home size={18} />, path: "/" },
  { name: "Students", icon: <Users size={18} />, path: "/students" },
  { name: "Teachers", icon: <UserCheck size={18} />, path: "/teachers" },
  { name: "Academics", icon: <BookOpen size={18} />, path: "/academics/classes" },
  { name: "Attendance", icon: <Clipboard size={18} />, path: "/attendance" },
  { name: "Routine", icon: <Calendar size={18} />, path: "/routine" },
  { name: "Fees", icon: <CreditCard size={18} />, path: "/fees" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`bg-gray-800 text-white h-screen flex flex-col transition-width duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <span className="text-lg font-bold">School Admin</span>}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>
      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition-colors mb-1 ${
              location.pathname.startsWith(item.path) ? "bg-gray-700" : ""
            }`}
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}