import api from "./axios";


export const markBulkAttendance = (data) => {
  return api.post(`attendance/bulk-mark/`, data);
};

export const getMonthlyAttendance = (year, month) => {
  return api.get(`attendance/monthly/?year=${year}&month=${month}`);
};