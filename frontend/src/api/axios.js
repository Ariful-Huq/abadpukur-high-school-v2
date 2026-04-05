// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://34.177.86.52/api/v1/",
});

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

export default API;