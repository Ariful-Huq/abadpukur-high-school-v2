// src/api/dashboardApi.js
import axios from "./axios";

// Fetch dashboard stats with error handling
export const getDashboardStats = async () => {
  try {
    const response = await axios.get("/dashboard/stats/");
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Unauthorized → redirect to login
      window.location.href = "/login";
    } else {
      console.error("Dashboard API error:", error);
      throw error;
    }
  }
};