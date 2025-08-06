// src/services/api.js
import axios from "axios";

// Base URL
const BASE_URL = "http://167.86.97.169/zahren/api/";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Refresh token endpoint
const REFRESH_URL = "token/refresh/";

// Refresh prosesi zamanı eyni anda çox sorğu gəlməsinin qarşısını almaq üçün
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor (token əlavə etmək üçün)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && !config.url.includes("login") && !config.url.includes("register")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (401 alındıqda refresh etməsi üçün)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("login") &&
      !originalRequest.url.includes("register")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        // Refresh token yoxdursa, çıxış (logout) prosesi ola bilər.
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axios.post(BASE_URL + REFRESH_URL, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);

        api.defaults.headers.common.Authorization = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api; 



// istifade qaydasi budu 
// import api from "./api";

// export const getProfile = async () => {
//   const response = await api.get("profile/");
//   return response.data;
// };
