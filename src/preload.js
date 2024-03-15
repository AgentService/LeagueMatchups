// preload.js
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    // Add other ipcRenderer methods if needed
  },
});

// Expose versions to the renderer process
contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("api", {
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  checkClientStatus: () => ipcRenderer.invoke("check-client-status"),
  send: (channel, data) => {
    const validChannels = ['open-path-dialog', 'get-summoner-name']; // Add more valid channels as needed
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validReceiveChannels = ["directory-path-selected", "summoner-name-response"];
    if (validReceiveChannels.includes(channel)) {
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  },
  removeReceive: (channel, func) => {
    const validReceiveChannels = ["summoner-name-response"];
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  },
});
