// wsClient.js
export const wsClient = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    setupWebSocket({ commit }) {
      console.log("WebSocket ...");
      window.ws
        .setupWebSocket()
        .then(() => {
          console.log("WebSocket setup complete.");
          // Commit mutations or dispatch other actions in response to WebSocket events
        })
        .catch((error) => {
          console.error("Error setting up WebSocket:", error);
        });
    },
    cleanupWebSocket() {
      window.ws
        .cleanupWebSocket()
        .then(() => {
          console.log("WebSocket cleanup complete.");
        })
        .catch((error) => {
          console.error("Error cleaning up WebSocket:", error);
        });
    },
  },
};
