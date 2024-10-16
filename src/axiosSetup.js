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

axios.interceptors.response.use(
  (response) => response, // Return the response if successful
  (error) => {
    const {
      config,
      response: { status },
    } = error;
    const originalRequest = config;

    // Check if we should refresh the token when a 401 Unauthorized is encountered
    if (status === 401 && !originalRequest._retry && shouldRefreshToken()) {
      originalRequest._retry = true;

      // Prevent multiple refresh requests
      if (!isRefreshing) {
        isRefreshing = true;
        store
          .dispatch("auth/refreshToken") // Dispatch the refreshToken action in the store
          .then((newToken) => {
            axios.defaults.headers.common["Authorization"] = "Bearer " + newToken;
            originalRequest.headers["Authorization"] = "Bearer " + newToken;
            isRefreshing = false;
            onRefreshed(newToken); // Notify all subscribers waiting for the token
          })
          .catch((refreshError) => {
            isRefreshing = false;
            console.error("Token refresh error:", refreshError);
            store.dispatch("auth/logout"); // Logout the user on token refresh failure
          });
      }

      // Queue the requests while waiting for the token refresh
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          resolve(axios(originalRequest)); // Retry the original request with the new token
        });
      });
    }

    // Handle other cases of 401 Unauthorized
    if (status === 401) {
      return Promise.reject("Refresh token rate limited.");
    }

    // For all other errors, reject the promise
    return Promise.reject(error);
  }
);
