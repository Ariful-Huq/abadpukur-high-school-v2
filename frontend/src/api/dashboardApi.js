import api from "./axios";

export const getDashboardStats = () => {
  return api.get("dashboard/stats/");
};