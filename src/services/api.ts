import axios from "axios";

// Since frontend is hosted on the same port as backend (Express + Vite router),
// we can use a clean relative path '/api'. This is robust and fully portable.
const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure Axios request interceptors to automatically append JWT Token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
