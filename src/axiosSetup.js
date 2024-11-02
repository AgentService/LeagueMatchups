import axios from "axios";
import store from "./store"; // Adjust the path to your Vuex store

let isRefreshing = false;
let subscribers = [];
let lastRefreshAttemptTimestamp = 0;
const refreshThreshold = 10000; // 10 seconds

function shouldRefreshToken() {
  const now = Date.now();
  if (now - lastRefreshAttemptTimestamp > refreshThreshold) {
    lastRefreshAttemptTimestamp = now;
    return true;
  }
  return false;
}

function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}

function onRefreshed(token) {
  subscribers.forEach((callback) => callback(token));
  subscribers = []; // Reset the subscribers array after notifying
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;
    const status = response ? response.status : null;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing && shouldRefreshToken()) {
        isRefreshing = true;

        try {
          console.log("Refreshing token...");
          const newToken = await store.dispatch("auth/refreshToken");
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          onRefreshed(newToken); // Notify all waiting requests with the new token

          // Set the new token on the original request and retry it
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          console.log("Reissuing original request with new token:", originalRequest);
          return axios(originalRequest);

        } catch (refreshError) {
          isRefreshing = false;
          store.dispatch("auth/logout"); // Logout if refresh fails
          return Promise.reject(new Error("Session expired. Please log in again."));
        } finally {
          isRefreshing = false;
        }
      }

      // Queue other requests while waiting for token refresh
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          // Ensure each queued request uses the latest token
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(axios(originalRequest));
        });
      });
    }

    if (status === 403 && originalRequest.url.includes("/auth/token")) {
      store.dispatch("auth/logout");
      return Promise.reject(new Error("Invalid or expired refresh token. Please log in again."));
    }

    return Promise.reject(error);
  }
);
