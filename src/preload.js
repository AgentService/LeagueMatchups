// preload.js
import { contextBridge, ipcRenderer } from "electron";

// Expose versions to the renderer process
contextBridge.exposeInMainWorld("versions", {
	node: () => process.versions.node,
	chrome: () => process.versions.chrome,
	electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("api", {
	send: (channel, data) => {
		let validSendChannels = ["get-summoner-name"];
		if (validSendChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	receive: (channel, func) => {
		let validReceiveChannels = ["summoner-name-response"];
		if (validReceiveChannels.includes(channel)) {
			const subscription = (event, ...args) => func(...args);
			ipcRenderer.on(channel, subscription);
			return () => {
				ipcRenderer.removeListener(channel, subscription);
			};
		}
	},
	// Add the removeReceive method to remove the listener
	removeReceive: (channel, func) => {
		let validReceiveChannels = ["summoner-name-response"];
		if (validReceiveChannels.includes(channel)) {
			ipcRenderer.removeListener(channel, func);
		}
	}
});
