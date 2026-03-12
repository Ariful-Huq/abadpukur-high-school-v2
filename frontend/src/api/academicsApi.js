import axios from "./axios";

export const getClasses = () => axios.get("academics/classes/");
export const createClass = (data) => axios.post("academics/classes/", data);
export const deleteClass = (id) => axios.delete(`academics/classes/${id}/`);

export const getSections = () => axios.get("academics/sections/");
export const createSection = (data) => axios.post("academics/sections/", data);
export const deleteSection = (id) => axios.delete(`academics/sections/${id}/`);

export const getSubjects = () => axios.get("academics/subjects/");
export const createSubject = (data) => axios.post("academics/subjects/", data);
export const deleteSubject = (id) => axios.delete(`academics/subjects/${id}/`);

export const getSessions = () => axios.get("academics/sessions/");
export const createSession = (data) => axios.post("academics/sessions/", data);
export const deleteSession = (id) => axios.delete(`academics/sessions/${id}/`);
export const setActiveSession = (id) => axios.post(`academics/sessions/${id}/set_active/`);