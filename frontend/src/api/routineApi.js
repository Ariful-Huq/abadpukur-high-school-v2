import api from "./axios";

// Periods (Time Slots)
export const getPeriods = () => api.get("routine/periods/");
export const createPeriod = (data) => api.post("routine/periods/", data);
export const deletePeriod = (id) => api.delete(`routine/periods/${id}/`);


// Routines
export const getRoutines = (classId, sectionId) => {
  let url = "routine/routines/";
  if (classId && sectionId) {
    url += `?school_class=${classId}&section=${sectionId}`;
  }
  return api.get(url);
};

export const createRoutineEntry = (data) => api.post("routine/routines/", data);
export const deleteRoutineEntry = (id) => api.delete(`routine/routines/${id}/`);