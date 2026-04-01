// frontend/src/api/resultsApi.js
import api from "./axios";

// Fetch all defined exams (1st Term, 2nd Term, etc.)
export const getExams = () => api.get("results/exams/");
export const createExam = (data) => api.post("results/exams/", data);
export const deleteExam = (id) => api.delete(`results/exams/${id}/`);
// To make sure we link exams to the right year:
export const getActiveSession = () => api.get("academics/sessions/?is_active=true");

// Fetch existing marks for a specific class/section/subject/exam 
// to populate the table if marks were already partially entered.
export const getMarks = (examId, subjectId, classId, sectionId) => {
    return api.get(`results/marks/?exam=${examId}&subject=${subjectId}&school_class=${classId}&section=${sectionId}`);
};

// Send the bulk marks list to the backend
export const submitBulkMarks = (data) => api.post("results/marks/bulk-entry/", data);

export const getStudentReport = (enrollmentId, examId) => {
  return api.get(`results/marks/student-report/?enrollment_id=${enrollmentId}&exam_id=${examId}`);
};

export const getTabulationSheet = (classId, sectionId, examId) => {
  return api.get(`results/marks/tabulation-sheet/?class_id=${classId}&section_id=${sectionId}&exam_id=${examId}`);
};