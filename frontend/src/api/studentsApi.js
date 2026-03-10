import axios from "./axios";

export const getStudents = () => axios.get("/students/");
export const getStudent = (id) => axios.get(`/students/${id}/`);

export const createStudent = (data) =>
  axios.post("/students/", data);

export const updateStudent = (id, data) =>
  axios.put(`/students/${id}/`, data);

export const deleteStudent = (id) =>
  axios.delete(`/students/${id}/`);