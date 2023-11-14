// store/modules/auth.js
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
import axios from "axios";
import Debug from "debug";
import { saveToLocalStorage, retrieveFromLocalStorage } from "../plugins/storage.mjs";

export const auth = {
    namespaced: true,
    state: () => ({
        user: null,
        isLoggedIn: false
    }),
    mutations: {
        SET_USER(state, user) {
            state.user = user;
            state.isLoggedIn = !!user;
        }
    },
    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await axios.post(`${baseUrl}/api/auth/login`, credentials);
                commit('SET_USER', response.data.user);
                // Additional actions upon successful login
            } catch (error) {
                console.error('Login failed', error.response);
                // Handle errors
            }
        }
    },
    getters: {
        // Optional getters for user and isLoggedIn
    }
};
