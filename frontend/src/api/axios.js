// frontend/src/api/axios.js
import axios from "axios";

const API = axios.create({
  // Change this from the GCP IP back to your local Django server
  baseURL: "http://127.0.0.1:8000/api/v1/",
});

// 1. REQUEST INTERCEPTOR: Attach Token to every request
API.interceptors.request.use((config) => {
  // MUST match localStorage.setItem("access_token", ...) in your AuthContext
  const token = localStorage.getItem("access_token"); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Interceptor: Token attached to request"); // Add this for debugging
  } else {
    console.log("Interceptor: No token found in localStorage");
  }
  return config;
});

// 2. RESPONSE INTERCEPTOR: Catch 401s (Force Logout/Expired)
API.interceptors.response.use(
  (response) => response, // If the request succeeds, just return the response
  (error) => {
    // If the server returns 401, the token is either expired or blacklisted
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Session invalidated or expired. Logging out...");
      
      // Clear all auth data so the UI updates
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Force a redirect to login page
      // Note: window.location.href is a hard reload, which ensures 
      // the AuthContext state is fully reset.
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;