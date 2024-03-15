// store/modules/auth.js
import axios from "axios";
import router from "../../renderer/router";
import Debug from "debug";
import {
  validateApiResponse,
  handleApiError,
  getAuthConfig,
} from "./utilities";

const debug = Debug("app:store:auth");
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const auth = {
  namespaced: true,
  state: () => ({
    user: null,
    isLoggedIn: false,
    token: null,
    authLoading: true, // Indicates whether authentication is in progress
  }),
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    user: (state) => state.user,
    token: (state) => state.token,
  },
  mutations: {
    SET_REFRESH_TOKEN(state, refreshToken) {
      state.refreshToken = refreshToken;
    },
    SET_USER(state, user) {
      state.user = user;
      state.isLoggedIn = !!user;
      debug("User set", user);
    },
    SET_TOKEN(state, token) {
      state.token = token;
      debug("Token set", token);
    },
    SET_AUTH_LOADING(state, loading) {
      state.authLoading = loading;
    },
  },
  actions: {
    async register({ commit }, userData) {
      commit("SET_AUTH_LOADING", true); // Optional: indicate that registration is in progress
      console.log(userData);
      try {
        const response = await axios.post(
          `${baseUrl}/api/user/register`,
          userData
        );
        const data = validateApiResponse(response);

        commit("SET_USER", data.user);
        commit("SET_TOKEN", data.token);

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        debug("Registration successful", data.user);
        return data; // Optionally return data on successful registration
      } catch (error) {
        handleApiError(error); // Process and return any API errors
        throw error; // Rethrow error to be handled by the caller
      } finally {
        commit("SET_AUTH_LOADING", false); // Indicate that registration process is complete
      }
    },
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(
          `${baseUrl}/api/auth/login`,
          credentials
        );
        const data = validateApiResponse(response);
        commit("SET_USER", data.user);
        commit("SET_TOKEN", data.token);
        commit("SET_REFRESH_TOKEN", data.refreshToken);

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        debug("Login successful", data.user);
      } catch (error) {
        return handleApiError(error);
      }
    },

    // Inside your Vuex store actions
    async refreshToken({ commit, state, dispatch }) {
      if (!state.refreshToken) {
        dispatch("logout");
      } else {
        try {
          const refreshToken = state.refreshToken;

          const response = await axios.post(`${baseUrl}/api/auth/token`, {
            refreshToken: refreshToken,
          });
          const { accessToken } = response.data;

          commit("SET_TOKEN", accessToken);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;

          return accessToken; // Ensure that the new access token is returned from the action
        } catch (error) {
          // Handle error, such as logging out the user if the refresh token is invalid
          dispatch("logout");
          console.error("Error refreshing the token:", error);
          throw error; // Rethrow the error so the caller knows the refresh failed
        }
      }
    },

    async reauthenticate({ commit, state }, { token, refreshToken }) {
      commit("SET_AUTH_LOADING", true);
      try {
        // Attempt to verify the access token
        let config = getAuthConfig(token); // Ensure getAuthConfig uses the provided token
        await axios.post(`${baseUrl}/api/auth/verifyToken`, {}, config);
debugger
        // If verification is successful, only renew the session with the current token if it has changed
        if (state.token !== token) {
          commit("SET_TOKEN", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        // Check if the error is a 401 Unauthorized
        if (error.response && error.response.status === 401) {
          // If the token is expired or invalid, attempt to refresh it
          debugger
          try {
            const refreshResponse = await axios.post(
              `${baseUrl}/api/auth/token`,
              { refreshToken }
            );
            const newToken = refreshResponse.data.token;

            // Only update the token if it is different from the current one
            if (state.token !== newToken) {
              commit("SET_TOKEN", newToken);
              axios.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${newToken}`;
            }
          } catch (refreshError) {
            // Handle failure to refresh the token, e.g., by logging out the user
            console.error("Token refresh failed:", refreshError);
            store.dispatch("auth/logout");
          }
        } else {
          // For any other errors, log and continue the promise chain
          console.error("Token verification failed:", error);
        }
      } finally {
        commit("SET_AUTH_LOADING", false);
      }
    },

    async logout({ commit }) {
      try {
        // Retrieve the user ID or other identifier as needed
        const userId = this.state.auth.user.id;
        const token = this.state.auth.token;
        let config = getAuthConfig(token); // Ensure getAuthConfig uses the provided token

        // Call the /logout API to invalidate the refresh token server-side
        await axios.post(`${baseUrl}/api/auth/logout`, { userId }, config);
        // Proceed with client-side logout
        commit("SET_USER", null);
        commit("SET_TOKEN", null);
        commit("SET_REFRESH_TOKEN", null);

        delete axios.defaults.headers.common["Authorization"];

        debug("Logout successful");
        router.push("/login"); // Make sure this is the last action
      } catch (error) {
        console.error("Logout failed:", error);
        // Handle error, possibly retry logout or alert the user
      }
    },
  },
};
