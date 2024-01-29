// store/modules/auth.js
import axios from 'axios';
import Debug from 'debug';
import { saveToLocalStorage, removeFromLocalStorage } from '../plugins/storage';
import { validateApiResponse, handleApiError, getAuthConfig } from './utilities';

const debug = Debug('app:store:auth');
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const auth = {
	namespaced: true,
	state: () => ({
		user: null,
		isLoggedIn: false,
		token: null,
		authLoading: true, // Indicates whether authentication is in progress
	}),
	getters: {
		isLoggedIn: state => state.isLoggedIn,
		user: state => state.user,
		token: state => state.token
	},
	mutations: {
		SET_USER(state, user) {
			state.user = user;
			state.isLoggedIn = !!user;
			debug('User set', user);
		},
		SET_TOKEN(state, token) {
			state.token = token;
			debug('Token set', token);
		},
		SET_AUTH_LOADING(state, loading) {
			state.authLoading = loading;
		},
	},
	actions: {
		// In your `auth.js` module
		async login({ commit }, credentials) {
			try {
				const response = await axios.post(`${baseUrl}/api/auth/login`, credentials);
				const data = validateApiResponse(response);

				commit('SET_USER', data.user);
				commit('SET_TOKEN', data.token);

				saveToLocalStorage('token', data.token);
				axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

				debug('Login successful', data.user);
			} catch (error) {
				return handleApiError(error);
			}
		},

		async reauthenticate({ commit }, token) {
			commit('SET_AUTH_LOADING', true);
			try {
				// Verify the token with your backend
				const response = await axios.post(`${baseUrl}/api/auth/verifyToken`, {}, getAuthConfig());
				const data = validateApiResponse(response);
				commit('SET_USER', data.user);

				axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
			} catch (error) {
				console.error('Token verification failed:', error);
				removeFromLocalStorage('token');
			} finally {
				commit('SET_AUTH_LOADING', false);
			}
		},
		logout({ commit }) {
			commit('SET_USER', null);
			commit('SET_TOKEN', null);

			removeFromLocalStorage('token');

			delete axios.defaults.headers.common['Authorization'];

			debug('Logout successful');
		}
	}
};
