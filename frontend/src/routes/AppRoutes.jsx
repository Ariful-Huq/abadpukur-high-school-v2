import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import ProtectedRoute from "../components/ProtectedRoute";

import Dashboard from "../pages/Dashboard/Dashboard";

import Classes from "../pages/Academics/Classes";
import Sections from "../pages/Academics/Sections";
import Subjects from "../pages/Academics/Subjects";
import AcademicSessions from "../pages/Academics/AcademicSessions";

import StudentsList from "../pages/Students/StudentsList";
import StudentForm from "../pages/Students/StudentForm";

import TeachersList from "../pages/Teachers/TeachersList";
import TeacherForm from "../pages/Teachers/TeacherForm";

import MonthlyAttendance from "../pages/Attendance/MonthlyAttendance";
import RoutineTable from "../pages/Routine/RoutineTable";
import Payments from "../pages/Fees/Payments";

export default function AppRoutes() {

  return (

    <Routes>

      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/academics/classes" 
        element={
          <ProtectedRoute>
            <Classes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/academics/sections" 
        element={
          <ProtectedRoute>
            <Sections />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/academics/subjects" 
        element={
          <ProtectedRoute>
            <Subjects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/academics/sessions" 
        element={
          <ProtectedRoute>
            <AcademicSessions />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <StudentsList />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/students/new" 
        element={
          <ProtectedRoute>
            <StudentForm />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/teachers" 
        element={
          <ProtectedRoute>
            <TeachersList />
          </ProtectedRoute>
        } 
      />
      <Route path="/teachers/new" element={<ProtectedRoute><TeacherForm /></ProtectedRoute>} />

      <Route path="/attendance" element={<ProtectedRoute><MonthlyAttendance /></ProtectedRoute>} />
      <Route path="/routine" element={<ProtectedRoute><RoutineTable /></ProtectedRoute>} />
      <Route path="/fees" element={<ProtectedRoute><Payments /></ProtectedRoute>} />

    </Routes>

  );
}