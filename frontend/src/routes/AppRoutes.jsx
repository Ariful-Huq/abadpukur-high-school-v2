// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// Layout & ProtectedRoute
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import * as Pages from "../pages"; // resolves via src/pages/index.js

// Menu config
import { menuItems } from "../config/menuConfig";

// Map path to component dynamically
const pageMap = {
  "/": Pages.Dashboard,
  "/students": Pages.StudentsList,
  "/students/new": Pages.StudentForm,
  "/teachers": Pages.TeachersList,
  "/teachers/new": Pages.TeacherForm,
  "/academics/classes": Pages.Classes,
  "/academics/sections": Pages.Sections,
  "/academics/subjects": Pages.Subjects,
  "/academics/sessions": Pages.AcademicSessions,
  "/attendance": Pages.MonthlyAttendance,
  "/routine": Pages.RoutineTable,
  "/fees": Pages.Payments,
};

export default function AppRoutes() {
  const generateRoutes = (items) => {
    const routes = [];
    items.forEach((item) => {
      if (item.children) {
        item.children.forEach((child) => {
          const PageComponent = pageMap[child.path];
          if (PageComponent) {
            routes.push(
              <Route key={child.path} path={child.path} element={<PageComponent />} />
            );
          }
        });
      } else {
        const PageComponent = pageMap[item.path];
        if (PageComponent) {
          routes.push(
            <Route key={item.path} path={item.path} element={<PageComponent />} />
          );
        }
      }
    });
    return routes;
  };

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Pages.Login />} />

      {/* Protected Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {generateRoutes(menuItems)}
      </Route>
    </Routes>
  );
}