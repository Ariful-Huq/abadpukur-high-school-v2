// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Layout & ProtectedRoute
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import * as Pages from "../pages"; 

// Menu config
import { menuItems } from "../config/menuConfig";

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
  "/attendance/mark": Pages.MarkAttendance,
  "/attendance/monthly": Pages.MonthlyAttendance,
  "/routine": Pages.RoutineTable,
  "/routine/periods": Pages.Periods,
  "/fees": Pages.Payments,
  "/fees/setup": Pages.FeeStructures,
  "/fees/defaulters": Pages.DefaulterList,
  "/users": Pages.UserManagement,
  "/audit-logs": Pages.LogManagement,
};

export default function AppRoutes() {
  const { user } = useContext(AuthContext);

  const generateRoutes = (items) => {
    const routes = [];
    
    items.forEach((item) => {
      // Logic: Only generate routes if user has the required role (or if no roles specified)
      const hasAccess = !item.roles || item.roles.includes(user?.role);

      if (hasAccess) {
        if (item.children) {
          item.children.forEach((child) => {
            const PageComponent = pageMap[child.path];
            if (PageComponent) {
              routes.push(
                <Route key={child.path} path={child.path} element={<PageComponent />} />
              );
            }
          });
        } else if (item.path) {
          const PageComponent = pageMap[item.path];
          if (PageComponent) {
            routes.push(
              <Route key={item.path} path={item.path} element={<PageComponent />} />
            );
          }
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
        {/* Generate dynamic routes based on role */}
        {generateRoutes(menuItems)}

        {/* Dynamic Detail Routes - Always include these but ProtectedRoute handles role check */}
        <Route path="/students/:id" element={<Pages.StudentProfile />} />
        <Route path="/students/:id/edit" element={<Pages.StudentForm />} />
        
        {/* Root Redirect to Dashboard */}
        <Route path="/" element={<Pages.Dashboard />} />
      </Route>

      {/* Catch-all: Redirect unknown routes to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}