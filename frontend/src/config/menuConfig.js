import {
  Home,
  Users,
  UserCheck,
  BookOpen,
  Layers,
  Grid,
  Book,
  CalendarDays,
  Clipboard,
  Calendar,
  CreditCard,
} from "lucide-react";

export const menuConfig = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/",
  },
  {
    title: "Students",
    icon: Users,
    path: "/students",
  },
  {
    title: "Teachers",
    icon: UserCheck,
    path: "/teachers",
  },
  {
    title: "Academics",
    icon: BookOpen,
    children: [
      {
        title: "Classes",
        icon: Layers,
        path: "/academics/classes",
      },
      {
        title: "Sections",
        icon: Grid,
        path: "/academics/sections",
      },
      {
        title: "Subjects",
        icon: Book,
        path: "/academics/subjects",
      },
      {
        title: "Academic Sessions",
        icon: CalendarDays,
        path: "/academics/sessions",
      },
    ],
  },
  {
    title: "Attendance",
    icon: Clipboard,
    path: "/attendance",
  },
  {
    title: "Routine",
    icon: Calendar,
    path: "/routine",
  },
  {
    title: "Fees",
    icon: CreditCard,
    path: "/fees",
  },
];
