import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  },
});

// Expose versions to the renderer process
contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("api", {
  startDownload: () => ipcRenderer.send("start-download"),
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  restartAppToUpdate: () => ipcRenderer.send("restart-app-to-update"),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on("update-not-available", callback),
  onDownloadProgress: (callback) => ipcRenderer.on("download-progress", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", callback),
  onUpdateError: (callback) => ipcRenderer.on("update-error", callback),
  checkClientStatus: () => ipcRenderer.invoke("check-client-status"),
  getCurrentGamePhase: () => ipcRenderer.invoke("get-current-game-phase"),
  send: (channel, data) => {
    const validChannels = ["open-path-dialog", "get-summoner-name"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validReceiveChannels = [
      "summoner-name-response",
      "update-available",
      "update-downloaded",
      "download-progress",
      "update-error",
      "current-release",
    ];
    if (validReceiveChannels.includes(channel)) {
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);

      // Return a cleanup function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  },
  receiveOnce: (channel, func) => {
    const validReceiveChannels = [
      "summoner-name-response",
      "update-available",
      "update-downloaded",
      "download-progress",
      "update-error",
    ];
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    }
  },
  removeReceive: (channel, func) => {
    const validReceiveChannels = [
      "summoner-name-response",
      "download-progress",
      "update-available",
      "update-downloaded",
      "update-error",
    ];
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  },
});

contextBridge.exposeInMainWorld("ws", {
  receive: (channel, func) => {
    const validChannels = [
      "client-status",
      "champion-picked",
      "champion-selected",
      "champ-select-team-picks-update",
      "champ-select-session-update",
      "champ-select-phase-update",
      "champ-select-local-player-pick-turn",
      "champ-select-enemy-pick-turn",
      "champ-select-done",
      "game-end-event",
      "game-start-event",
      "gameflow-phase-change",
      "get-current-game-phase",
      "post-game-stats",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));

      // Return a cleanup function
      return () => {
        ipcRenderer.removeListener(channel, func);
      };
    }
  },
  onWebSocketMessage: (callback) => {
    ipcRenderer.on("webSocket-message", (event, ...args) => callback(...args));
    return () => {
      ipcRenderer.removeListener("webSocket-message", callback);
    };
  },
});
