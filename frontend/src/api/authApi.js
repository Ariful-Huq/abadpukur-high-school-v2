// frontend/src/api/authApi.js
import axios from "./axios";

export const login = (data) =>
  axios.post("/token/", data);

export const refreshToken = (refresh) =>
  axios.post("/token/refresh/", { refresh });

export const logout = (refresh) =>
  axios.post("users/logout/", { refresh });

export const forceLogoutUser = (userId) =>
  axios.post(`users/${userId}/force_logout/`);

export const adminResetPassword = (userId, newPassword) =>
  axios.post(`users/${userId}/reset_password/`, { password: newPassword });