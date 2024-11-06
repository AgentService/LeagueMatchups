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

const defaultState = () => ({
  user: null,
  role: null,
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  authLoading: true,
});


export const auth = {
  namespaced: true,
  state: () => defaultState(),
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    user: (state) => state.user,
    token: (state) => state.token,
    role: (state) => state.role, // New getter for role
  },
  mutations: {
    RESET_STATE(state) {
      // Reset the state to its initial state
      Object.assign(state, defaultState());
    },
    SET_REFRESH_TOKEN(state, refreshToken) {
      state.refreshToken = refreshToken;
    },
    SET_USER(state, user) {
      state.user = user;
      state.role = user?.role || null; // Set role if available
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
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, credentials);
        const data = validateApiResponse(response);

        commit("SET_USER", data.user);
        commit("SET_TOKEN", data.token);
        commit("SET_REFRESH_TOKEN", data.refreshToken);

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        // Initialize summoner data after login
        await dispatch('summoner/initializeSummonerData', null, { root: true });

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
        dispatch("logout");  // If refresh fails, log the user out
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

        // Set the Authorization headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${validToken}`;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          try {
            const refreshedToken = await dispatch("refreshToken");
            if (refreshedToken) {
              commit("SET_TOKEN", refreshedToken);
              axios.defaults.headers.common["Authorization"] = `Bearer ${refreshedToken}`;
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            await dispatch("logout");
          }
        } else {
          console.error("Token verification failed:", error);
        }
      } finally {
        commit("SET_AUTH_LOADING", false);
      }
    },
    async logout({ commit, dispatch }) {
      try {
        const userId = this.state.auth.user.id;
        const token = this.state.auth.token;
        let config = getAuthConfig(token);

        // Invalidate the refresh token on the server
        await axios.post(`${baseUrl}/api/auth/logout`, { userId }, config);

        // Clear tokens from Vuex store
        commit("SET_USER", null);
        commit("SET_TOKEN", null);
        commit("SET_REFRESH_TOKEN", null);

        delete axios.defaults.headers.common["Authorization"];
        await dispatch("resetAllModules", null, { root: true });

        debug("Logout successful");
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);

        // Proceed with client-side logout even if the API call fails
        commit("SET_USER", null);
        commit("SET_TOKEN", null);
        commit("SET_REFRESH_TOKEN", null);

        delete axios.defaults.headers.common["Authorization"];
        await dispatch("resetAllModules", null, { root: true });

        router.push("/login");
      }
    },
    async ensureValidToken({ state, dispatch }) {
      if (isTokenExpired(state.token)) {
        // Token is expired, refresh it
        return await dispatch("refreshToken");
      }
      return state.token;  // Token is still valid, proceed
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