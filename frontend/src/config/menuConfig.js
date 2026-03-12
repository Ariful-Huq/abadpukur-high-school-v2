// src/config/menuConfig.js
import {
  Home,
  Users,
  UserCheck,
  BookOpen,
  Clipboard,
  Calendar,
  CreditCard,
  List,
  FileText,
  Layers,
  CalendarDays,
} from "lucide-react";

export const menuItems = [
  {
    name: "Dashboard",
    icon: Home,
    path: "/",
  },

  {
    name: "Students",
    icon: Users,
    children: [
      { name: "All Students", path: "/students", icon: List },
      { name: "New Student", path: "/students/new", icon: FileText },
    ],
  },

  {
    name: "Teachers",
    icon: UserCheck,
    children: [
      { name: "All Teachers", path: "/teachers", icon: List },
      { name: "New Teacher", path: "/teachers/new", icon: FileText },
    ],
  },

  {
    name: "Academics",
    icon: BookOpen,
    children: [
      { name: "Classes", path: "/academics/classes", icon: Layers },
      { name: "Sections", path: "/academics/sections", icon: List },
      { name: "Subjects", path: "/academics/subjects", icon: FileText },
      { name: "Academic Sessions", path: "/academics/sessions", icon: CalendarDays },
    ],
  },

  {
    name: "Attendance",
    icon: Clipboard,
    children: [
      { name: "Mark Attendance", path: "/attendance/mark", icon: UserCheck }, // Daily Marking
      { name: "Monthly Report", path: "/attendance/monthly", icon: Calendar }, // The Grid
    ],
  },

  { name: "Routine", icon: Calendar, path: "/routine" },
  { name: "Fees", icon: CreditCard, path: "/fees" },
];