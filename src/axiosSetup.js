import axios from "axios";
import store from "./store"; // Adjust the path to your Vuex store

let isRefreshing = false;
let subscribers = [];
let lastRefreshAttemptTimestamp = 0;
const refreshThreshold = 10000; // 10 seconds

// Check if we should refresh the token (based on the threshold)
function shouldRefreshToken() {
  const now = Date.now();
  if (now - lastRefreshAttemptTimestamp > refreshThreshold) {
    lastRefreshAttemptTimestamp = now;
    return true;
  }
  return false;
}

// Add a new subscriber (requests waiting for the new token)
function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}

// Notify all subscribers when the token has been refreshed
function onRefreshed(token) {
  subscribers.forEach((callback) => callback(token));
  subscribers = []; // Reset the subscribers array after notifying
}

// Axios response interceptor for handling token expiration and refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const {
      config,
      response: { status },
    } = error;
    const originalRequest = config;

    // Refresh Token Flow
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await store.dispatch("auth/refreshToken");
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          onRefreshed(newToken);
          return axios(originalRequest);
        } catch (refreshError) {
          store.dispatch("auth/logout"); // Logout if refresh fails
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(axios(originalRequest));
        });
      });
    }

    if (status === 403) {
      store.dispatch("auth/logout");
      return Promise.reject("Invalid or expired refresh token.");
    }

    return Promise.reject(error);
  }
);

