import axios from "./axios";

export const login = (data) =>
  axios.post("/token/", data);

export const refreshToken = (refresh) =>
  axios.post("/token/refresh/", { refresh });