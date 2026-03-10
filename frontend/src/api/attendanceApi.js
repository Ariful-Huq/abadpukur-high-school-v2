import api from "./axios";

export const getMonthlyAttendance = (year, month) => {
  return api.get(`attendance/monthly/?year=${year}&month=${month}`);
};