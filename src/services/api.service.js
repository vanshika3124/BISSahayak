import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ===============================
// GET ACCESS TOKEN
// ===============================
export function getToken() {
  return localStorage.getItem("bis_access_token");
}

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// REFRESH TOKEN CONTROL
// ===============================
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      // ===========================
      // If refresh already running
      // ===========================
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Don't use api.post here because we don't want
        // the old Authorization token attached to refresh request
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken = response.data.accessToken;

        if (!newAccessToken) {
          throw new Error("New access token not received");
        }

        // Save new token
        localStorage.setItem(
          "bis_access_token",
          newAccessToken
        );

        // Notify waiting requests
        onRefreshed(newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed → user needs to login again
        localStorage.removeItem("bis_access_token");

        refreshSubscribers = [];

        // Optional: redirect to login
        window.location.href = "/login";

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===============================
// AUTH APIs
// ===============================

export async function register({
  fullName,
  email,
  password,
}) {
  const { data } = await api.post("/auth/register", {
    fullName,
    email,
    password,
  });

  if (data.accessToken) {
    localStorage.setItem(
      "bis_access_token",
      data.accessToken
    );
  }

  return data;
}

export async function verifyEmail({ email, otp }) {
  const { data } = await api.post("/auth/verify-email", {
    email,
    otp,
  });

  if (data.accessToken) {
    localStorage.setItem(
      "bis_access_token",
      data.accessToken
    );
  }

  return data;
}

export async function resendOtp({
  fullName,
  email,
  password,
}) {
  const { data } = await api.post("/auth/register", {
    fullName,
    email,
    password,
  });

  return data;
}

export async function login({
  email,
  password,
}) {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  if (data.accessToken) {
    localStorage.setItem(
      "bis_access_token",
      data.accessToken
    );
  }

  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/get-me");
  return data;
}

export async function refreshToken() {
  const { data } = await api.post("/auth/refresh-token");

  if (data.accessToken) {
    localStorage.setItem(
      "bis_access_token",
      data.accessToken
    );
  }

  return data;
}

export async function logout() {
  await api.post("/auth/logout");
  localStorage.removeItem("bis_access_token");
}

export async function logoutAll() {
  await api.post("/auth/logout-all");
  localStorage.removeItem("bis_access_token");
}

export function isAuthenticated() {
  return !!getToken();
}

export default api;