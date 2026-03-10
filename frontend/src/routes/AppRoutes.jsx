// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// Layout
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import Dashboard from "../pages/Dashboard/Dashboard";

// Academics
import Classes from "../pages/Academics/Classes";
import Sections from "../pages/Academics/Sections";
import Subjects from "../pages/Academics/Subjects";
import AcademicSessions from "../pages/Academics/AcademicSessions";

// Students
import StudentsList from "../pages/Students/StudentsList";
import StudentForm from "../pages/Students/StudentForm";

// Teachers
import TeachersList from "../pages/Teachers/TeachersList";
import TeacherForm from "../pages/Teachers/TeacherForm";

// Attendance & Routine
import MonthlyAttendance from "../pages/Attendance/MonthlyAttendance";
import RoutineTable from "../pages/Routine/RoutineTable";

// Fees
import Payments from "../pages/Fees/Payments";

// Auth
import Login from "../pages/Auth/Login";

export default function AppRoutes() {
  return (
    <Routes>
      
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Students */}
        <Route path="students" element={<StudentsList />} />
        <Route path="students/new" element={<StudentForm />} />

        {/* Teachers */}
        <Route path="teachers" element={<TeachersList />} />
        <Route path="teachers/new" element={<TeacherForm />} />

        {/* Academics */}
        <Route path="academics/classes" element={<Classes />} />
        <Route path="academics/sections" element={<Sections />} />
        <Route path="academics/subjects" element={<Subjects />} />
        <Route path="academics/sessions" element={<AcademicSessions />} />

        {/* Attendance */}
        <Route path="attendance" element={<MonthlyAttendance />} />

        {/* Routine */}
        <Route path="routine" element={<RoutineTable />} />

        {/* Fees */}
        <Route path="fees" element={<Payments />} />

      </Route>

    </Routes>
  );
}