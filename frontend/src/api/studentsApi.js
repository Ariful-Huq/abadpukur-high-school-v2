// src/api/studentsApi.js
import axios from "./axios";

/**
 * Fetches students. 
 * Supports filtering by school_class and section IDs for attendance marking.
 */
export const getStudents = (classId = null, sectionId = null, search = "") => {
  let url = "students/";
  const params = [];
  
  if (classId) params.push(`school_class=${classId}`);
  if (sectionId) params.push(`section=${sectionId}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  
  return axios.get(url);
};

export const getStudent = (id) => axios.get(`students/${id}/`);

export const createStudent = (data) =>
  axios.post("students/", data);

export const updateStudent = (id, data) =>
  axios.put(`students/${id}/`, data);

export const deleteStudent = (id) =>
  axios.delete(`students/${id}/`);

// New auto-roll helper
export const getNextRollNumber = (classId, sectionId) => 
  axios.get(`students/get_next_roll/?class_id=${classId}&section_id=${sectionId}`);