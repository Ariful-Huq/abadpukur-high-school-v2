import api from "./axios";


export const markBulkAttendance = (data) => {
  return api.post(`attendance/bulk-mark/`, data);
};

export const getMonthlyAttendance = (year, month, class_id, section_id) => {
  let url = `attendance/monthly/?year=${year}&month=${month}`;
  if (class_id) {
    url += `&class_id=${class_id}`;
  }
  if (section_id) {
    url += `&section_id=${section_id}`;
  }
  
  return api.get(url);
};