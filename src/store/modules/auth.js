// store/modules/auth.js
import axios from "axios";
import Debug from "debug";
import { saveToLocalStorage } from "../plugins/storage";

const debug = Debug("app:store:auth");
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const auth = {
    namespaced: true,
    state: () => ({
        user: null,
        isLoggedIn: false,
        token: null // Add token to the state
    }),
    mutations: {
        SET_USER(state, user) {
            state.user = user;
            state.isLoggedIn = !!user;
            debug('User set', user);
        },
        SET_TOKEN(state, token) {
            state.token = token;
            debug('Token set', token);
        }
    },
    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await axios.post(`${baseUrl}/api/auth/login`, credentials);
                commit('SET_USER', response.data.user);
                commit('SET_TOKEN', response.data.token); // Assuming the token is returned in the response

                saveToLocalStorage('token', response.data.token); // Or use the storage plugin
                // Set the Axios Authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                debug('Login successful', response.data.user);
            } catch (error) {
                console.error('Login failed', error.response);
                // Handle login errors
            }
        },
        logout({ commit }) {
            commit('SET_USER', null);
            commit('SET_TOKEN', null);

            // Remove the token from sessionStorage or localStorage
            sessionStorage.removeItem('token');

            // Remove the Axios default Authorization header
            delete axios.defaults.headers.common['Authorization'];

            debug('Logout successful');
        }
    },
    getters: {
        // Optional getters for user and isLoggedIn
    }
};
