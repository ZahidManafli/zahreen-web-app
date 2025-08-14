import axios from "axios";

const api = axios.create({
  baseURL: "http://167.86.97.169/zahren/api/",
});

// Log each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Log request
  console.log("📤 Request:", {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });

  return config;
});

let isRefreshing = false;

api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log("✅ Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log failed response
    if (error.response) {
      console.warn("❌ Error Response:", {
        url: originalRequest?.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.warn("❌ Network Error:", error.message);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem("refresh");
        const response = await axios.post(
          "http://167.86.97.169/zahren/api/token/refresh/",
          { refresh }
        );
        const newToken = response.data.access;

        localStorage.setItem("token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        isRefreshing = false;

        console.log("🔄 Retrying request after token refresh");
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error("🔐 Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;