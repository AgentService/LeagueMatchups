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
  subscribers = []; // Reset the subscribers array after all callbacks have been called
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const {
      config,
      response: { status },
    } = error;
    const originalRequest = config;

    // Check if we should refresh the token
    if (status === 401 && !originalRequest._retry && shouldRefreshToken()) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        store
          .dispatch("auth/refreshToken")
          .then((newToken) => {
            axios.defaults.headers.common["Authorization"] =
              "Bearer " + newToken;
            originalRequest.headers["Authorization"] = "Bearer " + newToken;
            isRefreshing = false;
            onRefreshed(newToken); // Notify subscribers
          })
          .catch((refreshError) => {
            isRefreshing = false;
            console.error("Token refresh error:", refreshError);
            // Handle token refresh error, e.g., by logging out
          });
      }

      // Return the original request promise
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          resolve(axios(originalRequest));
        });
      });
    } else if (status === 401) {
      // If a refresh isn't allowed due to rate limiting, reject the promise
      return Promise.reject("Refresh token rate limited.");
    }

    return Promise.reject(error);
  }
);
