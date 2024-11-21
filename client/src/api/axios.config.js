import axios from "axios";

const baseURL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : "http://localhost:9000";

const API = axios.create({
  baseURL,
});

API.interceptors.request.use(
  function (req) {
    const token = localStorage.getItem("token");
    if (token) req.headers["auth-token"] = token;
    return req;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const APIWithouToken = axios.create({
  baseURL,
});

export default API;
export { APIWithouToken };
