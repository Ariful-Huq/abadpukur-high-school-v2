// frontend/src/api/teachersApi.js
import axios from "./axios";

// Removed the leading "/" from all paths
export const getTeachers = () => axios.get("teachers/");

export const getTeacher = (id) => axios.get(`teachers/${id}/`);

export const createTeacher = (data) => 
  axios.post("teachers/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateTeacher = (id, data) => 
  axios.patch(`teachers/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteTeacher = (id) => 
  axios.delete(`teachers/${id}/`);