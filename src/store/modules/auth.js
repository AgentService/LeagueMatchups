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
        const response = await axios.post(`${baseUrl}/api/auth/login`, credentials);
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

    async refreshToken({ commit, state, dispatch }) {
      if (!state.refreshToken) {
        await dispatch("logout");
        return;
      }

      try {
        const refreshToken = state.refreshToken;
        const response = await axios.post(`${baseUrl}/api/auth/token`, {
          refreshToken,
        });
        const { accessToken } = response.data;

        // Update the token in state and set Authorization headers
        commit("SET_TOKEN", accessToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        return accessToken;
      } catch (error) {
        dispatch("logout"); // If refresh fails, log the user out
        console.error("Error refreshing the token:", error);
        throw error;
      }
    },


    async reauthenticate({ commit, state, dispatch }, { token, refreshToken }) {
      commit("SET_AUTH_LOADING", true);
      try {
        // Ensure the token is valid before verifying
        const validToken = await dispatch("ensureValidToken");
        if (!validToken) throw new Error("Token refresh failed");

        // Attempt to verify the access token with the API
        let config = getAuthConfig(validToken);
        await axios.post(`${baseUrl}/api/auth/verifyToken`, {}, config);

        // Set the token only if it has changed
        if (state.token !== validToken) {
          commit("SET_TOKEN", validToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${validToken}`;
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          try {
            const refreshResponse = await dispatch("refreshToken");
            if (refreshResponse) {
              commit("SET_TOKEN", refreshResponse);
              axios.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${refreshResponse}`;
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            dispatch("logout");
          }
        } else {
          console.error("Token verification failed:", error);
        }
      } finally {
        commit("SET_AUTH_LOADING", false);
      }
    },

    async logout({ commit }) {
      try {
        const userId = this.state.auth.user.id;
        const token = this.state.auth.token;
        let config = getAuthConfig(token);

        // Invalidate the refresh token on the server
        await axios.post(`${baseUrl}/api/auth/logout`, { userId }, config);

        // Clear tokens from Vuex store and localStorage
        commit("SET_USER", null);
        commit("SET_TOKEN", null);
        commit("SET_REFRESH_TOKEN", null);

        delete axios.defaults.headers.common["Authorization"];

        debug("Logout successful");
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);

        // Proceed with client-side logout even if the API call fails
        commit("SET_USER", null);
        commit("SET_TOKEN", null);
        commit("SET_REFRESH_TOKEN", null);

        delete axios.defaults.headers.common["Authorization"];

        router.push("/login");
      }
    },
    async ensureValidToken({ state, dispatch }) {
      if (isTokenExpired(state.token)) {
        // Token is expired, refresh it
        return await dispatch("refreshToken");
      }
      return state.token; // Token is still valid, proceed
    }
  },
};


// Define isTokenExpired as a helper function outside the actions
function isTokenExpired(token) {
  if (!token) return true;
  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
}