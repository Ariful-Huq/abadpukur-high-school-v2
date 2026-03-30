// src/config/menuConfig.js
import {
  Home,
  Users,
  UserCheck,
  UserCircle,
  BookOpen,
  Clipboard,
  ClipboardList,
  Calendar,
  CreditCard,
  List,
  FileText,
  Layers,
  CalendarDays,
  Settings,
  AlertCircle,
  GraduationCap,
  FileSpreadsheet,
  Award
} from "lucide-react";

export const menuItems = [
  {
    name: "Dashboard",
    icon: Home,
    path: "/",
    roles: ["admin", "teacher", "staff"], // Visible to all staff
  },

  {
    name: "Students",
    icon: Users,
    roles: ["admin"], // Admin only
    children: [
      { name: "All Students", path: "/students", icon: List },
      { name: "New Student", path: "/students/new", icon: FileText },
    ],
  },

  {
    name: "Teachers",
    icon: UserCheck,
    roles: ["admin"], // Admin only
    children: [
      { name: "All Teachers", path: "/teachers", icon: List },
      { name: "New Teacher", path: "/teachers/new", icon: FileText },
    ],
  },

  {
    name: "Academics",
    icon: BookOpen,
    roles: ["admin"], // Admin only
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
    roles: ["admin", "teacher"], // Teachers can mark attendance
    children: [
      { name: "Mark Attendance", path: "/attendance/mark", icon: UserCheck }, // Daily Marking
      { name: "Monthly Report", path: "/attendance/monthly", icon: Calendar }, // The Grid
    ],
  },

  {
    name: "Results",
    icon: GraduationCap,
    roles: ["admin", "teacher"], // Teachers can enter marks
    children: [
      { name: "Mark Entry", path: "/results/mark-entry", icon: FileSpreadsheet },
      { name: "Exam Setup", path: "/results/setup", icon: Settings },
      { name: "Term Reports", path: "/results/reports", icon: Award },
    ],
  },

  { name: "Routine",
    icon: Calendar,
    children: [
      {name: "Class Routine", path: "/routine" },
      {name: "Manage Periods", path: "/routine/periods" },
    ],
  },

  { 
    name: "Fees", 
    icon: CreditCard,
    roles: ["admin"], // Hide from teachers 
    children: [
      { name: "Payments", path: "/fees", icon: List },
      { name: "Setup Fees", path: "/fees/setup", icon: Settings },
      { name: "Defaulter List", path: "/fees/defaulters", icon: AlertCircle },
    ]
  },

  {
    name: "Users",
    icon: UserCircle, // Using the Users icon from lucide
    path: "/users",
    roles: ["admin"], // ONLY admins see this
  },

  {
    name: "Logs",
    icon: ClipboardList, // Using the ClipboardList icon from lucide
    path: "/audit-logs",
    roles: ["admin"], // ONLY admins see this
  },
];