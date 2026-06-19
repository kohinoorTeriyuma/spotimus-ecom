import axios from "axios";

// Since frontend is hosted on the same port as backend (Express + Vite router),
// we can use a clean relative path '/api'. This is robust and fully portable.
const API = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
