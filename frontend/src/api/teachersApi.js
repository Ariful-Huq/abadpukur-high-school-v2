import axios from "./axios";

export const getTeachers = () => axios.get("/teachers/");
export const getTeacher = (id) => axios.get(`/teachers/${id}/`);

export const createTeacher = (data) =>
  axios.post("/teachers/", data);

export const updateTeacher = (id, data) =>
  axios.put(`/teachers/${id}/`, data);

export const deleteTeacher = (id) =>
  axios.delete(`/teachers/${id}/`);