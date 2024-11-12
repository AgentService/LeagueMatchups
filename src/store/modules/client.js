// store/modules/client.js
import Debug from "debug";

const debug = Debug("app:store:client");

const defaultState = () => ({
    clientConnected: false,
    clientLoading: false, // Loading state for async client actions
});

export const client = {
    namespaced: true,
    state: () => defaultState(),
    getters: {
        clientConnected: (state) => state.clientConnected,
        clientLoading: (state) => state.clientLoading,
    },
    mutations: {
        SET_CLIENT_CONNECTED(state, status) {
            state.clientConnected = status;
            debug("Client connected state updated:", status);
        },
        SET_CLIENT_LOADING(state, loading) {
            state.clientLoading = loading;
        },
        RESET_CLIENT_STATE(state) {
            Object.assign(state, defaultState());
        },
    },
    actions: {
        // Action to handle client connection updates
        updateClientStatus({ commit }, status) {
            commit("SET_CLIENT_CONNECTED", status);
            debug("Client status updated in store:", status);
        },

        // Async action to check client connection (e.g., via API or WebSocket)
        async checkClientStatus({ commit }) {
            commit("SET_CLIENT_LOADING", true);
            try {
                // Example: Assume window.api.checkClientStatus() returns a promise with a connection status
                const response = await window.api.checkClientStatus();
                const isConnected = response?.connected || false;
                commit("SET_CLIENT_CONNECTED", isConnected);
                debug("Checked client status:", isConnected);
            } catch (error) {
                console.error("Error checking client status:", error);
                commit("SET_CLIENT_CONNECTED", false);
            } finally {
                commit("SET_CLIENT_LOADING", false);
            }
        },

        async resetClientConnection({ commit }) {
            // Optionally reset client connection state
            commit("RESET_CLIENT_STATE");
            debug("Client connection state reset");
        },
    },
};
