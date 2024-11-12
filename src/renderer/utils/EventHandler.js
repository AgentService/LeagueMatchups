// src/utils/EventHandler.js

import store from '../../store';

class EventHandler {
    constructor(webSocket, ipcRenderer) {
        this.webSocket = webSocket;       // WebSocket instance
        this.ipcRenderer = ipcRenderer;   // IPC instance
        this.subscriptions = new Map();   // Track listeners for cleanup
        this.initializeEventListeners();
    }

    // Initialize only the WebSocket client-status event for now
    initializeEventListeners() {
        debugger
        this.addWebSocketListener('client-status', this.handleClientStatus);
    }

    // Generic function to add WebSocket event listeners
    addWebSocketListener(event, callback) {
        const subscription = (...args) => callback(...args);
        this.webSocket.receive(event, subscription);
        this.subscriptions.set(event, subscription);

        // Return a cleanup function
        return () => this.removeWebSocketListener(event);
    }

    // Remove a specific WebSocket event listener
    removeWebSocketListener(event) {
        const subscription = this.subscriptions.get(event);
        if (subscription) {
            this.webSocket.removeListener(event, subscription);
            this.subscriptions.delete(event);
        }
    }

    // Cleanup all listeners (useful on component unmount)
    cleanupAllListeners() {
        this.subscriptions.forEach((_, key) => this.removeWebSocketListener(key));
    }

    // WebSocket event-specific handler methods
    handleClientStatus(status) {
        store.commit('client/SET_CLIENT_CONNECTED', status.connected);
        console.log('Client connection status received:', status.connected);
    }
}

export default EventHandler;
