const { ipcMain, app, BrowserWindow, screen, dialog } = require("electron");
import fetch from "node-fetch";  // Use static import if bundling issues occur

const fs = require("fs");
const {
  createWebSocketConnection,
  authenticate,
  LeagueClient,
} = require("league-connect");

const { autoUpdater } = require("electron-updater");
const EventEmitter = require("events");
import ChampSelectSession from "./classes/ChampSelectSession";
// import { setupWebSocketEventHandlers } from "./classes/WebSocketEvents";

import WebSocketEventHandlers from "./classes/WebSocketEventHandlers";

if (!process.env.NODE_ENV) {
  log.info("NODE_ENV not set, defaulting to production");
  process.env.NODE_ENV = 'production';
}

autoUpdater.channel = "latest";

class MockAutoUpdater extends EventEmitter {
  constructor() {
    super();
    // Define the mock update info outside the method
    this.mockUpdateInfo = {
      version: "2.0.0",
      releaseDate: "2024-03-17",
      releaseName: "Current Exciting Features",
      releaseNotes: "Current improvements and bug fixes.",
    };

    this.mockUpdateInfoUpdate = {
      version: "3.3.3",
      releaseDate: "2024-03-19",
      releaseName: "New Exciting Features",
      releaseNotes: "New a lot of improvements and bug fixes.",
    };
    this.autoDownload = true; // Simulate autoDownload setting
  }
  checkForUpdates() {
    console.log("Checking for updates...");
    setTimeout(() => {
      this.emit("update-available", this.mockUpdateInfo);
    }, 0);
  }

  downloadUpdate() {
    console.log("Downloading update...");
    setTimeout(() => {
      this.emit("download-progress", { percent: 25 });
    }, 0);
    setTimeout(() => {
      this.emit("download-progress", { percent: 50 });
    }, 500);
    setTimeout(() => {
      this.emit("download-progress", { percent: 75 });
    }, 1000);
    setTimeout(() => {
      this.emit("download-progress", { percent: 100 });
    }, 1500);
    setTimeout(() => {
      this.emit("update-downloaded", this.mockUpdateInfoUpdate);
    }, 2000);
  }

  quitAndInstall() {
    console.log("Quitting and installing update...");
    this.emit("confirm-update-installation");
  }

  checkForUpdatesAndNotify() {
    console.log("MockAutoUpdater: Checking for updates and notify");
    // Immediately emit 'update-available' for simplicity, but could be delayed as in checkForUpdates
    this.emit("update-available", this.mockUpdateInfo);

    // Simulate a delay as if checking and then downloading updates
    setTimeout(() => {
      if (this.autoDownload) {
        this.downloadUpdate();
      }
    }, 1000);

    // Return a mock promise that resolves to an object similar to UpdateCheckResult
    return Promise.resolve({
      updateInfo: this.mockUpdateInfo,
      downloadPromise: this.autoDownload
        ? Promise.resolve(["path/to/download"])
        : undefined,
      // cancellationToken not needed per your requirement
      versionInfo: this.mockUpdateInfo, // Assuming for backward compatibility
    });
  }

  simulateError(errorMessage) {
    const error = new Error(errorMessage);
    console.log(`MockAutoUpdater: Simulating error - ${errorMessage}`);
    this.emit("error", error);
  }
}

const mockAutoUpdater = new MockAutoUpdater();

let updater =
  process.env.NODE_ENV === "DEVELOPMENT" ? autoUpdater : autoUpdater; // mockAutoUpdater for development, autoUpdater for production

const log = require("electron-log");
const path = require("path");
require("dotenv").config();
const Debug = require("debug");
const debug = Debug("app:main");
Debug.enable("*");

const Store = require("electron-store");
const store = new Store();

// Redirect console output to a file
console.error = log.error;
log.transports.file.level = "info";
log.info("App starting...");

log.info("dirname", __dirname);
log.info("NODE_ENV", process.env.NODE_ENV);

let mainWindow = null;
let isAppStartup = true;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  debug("Electron Squirrel Startup");
  app.quit();
}

store.set("leagueClientPath", null);
store.set("detectionMethod", store.get("detectionMethod", "process")); // Default to 'process'

async function initializeWebSocket(credentials) {
  try {
    debug("Attempting to establish WebSocket connection...");
    // If successful, proceed to establish the WebSocket connection
    if (credentials) {
      const ws = await createWebSocketConnection({
        authenticationOptions: { awaitConnection: true },
        pollInterval: 1000,
        maxRetries: 10,
      });
      debug("WebSocket connection established.");
      const webSocketEventHandlers = new WebSocketEventHandlers(mainWindow);

      webSocketEventHandlers.setup(ws);

      // setupWebSocketEventHandlers(ws, mainWindow);
    }
  } catch (error) {
    debug("League client not detected or WebSocket connection failed:", error);
  }
}

// function setupWebSocketSubscriptions(ws) {
//   let champSelectSession = null;

//   ws.subscribe("/lol-champ-select/v1/session", (event) => {
//     if (event.eventType === "Delete") {
//       log.info("Champ select session deleted.");
//       champSelectSession = null;
//       mainWindow.webContents.send("champ-select-session-update", null);
//       mainWindow.webContents.send("champ-select-phase-update", null);
//       return;
//     }

//     const oldSessionData = champSelectSession;
//     const newSessionData = new ChampSelectSession(event);
//     champSelectSession = newSessionData;

//     mainWindow.webContents.send("champ-select-session-update", newSessionData);

//     if (oldSessionData !== null) {
//       if (newSessionData.getPhase() !== oldSessionData.getPhase()) {
//         log.info("Champ select phase updated:", newSessionData.getPhase());
//         mainWindow.webContents.send(
//           "champ-select-phase-update",
//           newSessionData.getPhase()
//         );
//       }

//       if (
//         newSessionData.isBanPhase() &&
//         oldSessionData.getPhase() === "PLANNING"
//       ) {
//         log.info("Ban phase started.");
//         mainWindow.webContents.send(
//           "champ-select-local-player-ban-turn",
//           newSessionData.ownBanActionId
//         );
//       }

//       if (
//         newSessionData.inProgressActionIds.includes(
//           newSessionData.ownPickActionId
//         ) &&
//         !oldSessionData.inProgressActionIds.includes(
//           newSessionData.ownPickActionId
//         )
//       ) {
//         log.info("Pick phase started.");
//         mainWindow.webContents.send(
//           "champ-select-local-player-pick-turn",
//           newSessionData.ownPickActionId
//         );
//       }

//       // Reflecting changes in champion picks
//       reflectChampionPicksChanges(oldSessionData, newSessionData);

//       // Placeholder for additional logic you may need
//       // ...
//     } else {
//       mainWindow.webContents.send(
//         "champ-select-phase-update",
//         newSessionData.getPhase()
//       );
//     }
//   });
// }

// let previousPickState = {
//   championId: null,
//   completed: false,
// };

// function reflectChampionPicksChanges(oldSession, newSession) {
//   const newLocalPlayerPickAction = newSession.getActionById(
//     newSession.ownPickActionId
//   );

//   // Proceed only if there's a new pick action to consider
//   if (newLocalPlayerPickAction) {
//     const isChampionChange =
//       previousPickState.championId !== newLocalPlayerPickAction.championId;
//     const isCompletionChange =
//       previousPickState.completed !== newLocalPlayerPickAction.completed;

//     // Trigger events only if there's a change in champion selection or completion status
//     if (isChampionChange || isCompletionChange) {
//       if (newLocalPlayerPickAction.completed) {
//         log.info(
//           "Local player has picked a champion:",
//           newLocalPlayerPickAction
//         );
//         mainWindow.webContents.send(
//           "champion-picked",
//           newLocalPlayerPickAction.championId
//         );
//       } else {
//         log.info(
//           "Local player is selecting a champion:",
//           newLocalPlayerPickAction
//         );
//         mainWindow.webContents.send(
//           "champion-selected",
//           newLocalPlayerPickAction.championId
//         );
//       }

//       // Update the previous state for the next comparison
//       previousPickState = {
//         championId: newLocalPlayerPickAction.championId,
//         completed: newLocalPlayerPickAction.completed,
//       };
//     }
//   }
// }

async function fetchSummonerNameWithRetry(
  credentials,
  retries = 3,
  interval = 5000,
  initialDelay = 2000 // Default initial delay of 2000ms
) {
  // Wait for the initial delay before starting the retries
  if (initialDelay > 0) {
    console.log(`Waiting for ${initialDelay}ms before the first attempt...`);
    await new Promise((resolve) => setTimeout(resolve, initialDelay));
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchSummonerName(credentials); // Replace with your actual fetching logic
    } catch (error) {
      console.log(`Attempt ${attempt} failed, retrying in ${interval}ms...`);
      // Wait for the interval delay before retrying, except after the last attempt
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
  }
  throw new Error("All attempts to fetch summoner name failed.");
}

async function setupLeagueClientMonitoring() {
  try {
    const credentials = await authenticate({
      awaitConnection: true,
      pollInterval: 2500,
    });

    global.credentials = credentials;

    console.log("League client found. Credentials obtained.");
    notifyClientStatus(true);

    const client = new LeagueClient(credentials, { pollInterval: 1000 });

    // Fetch summoner name on initial setup
    await initializeWebSocket(credentials);
    await fetchAndSendSummonerName(credentials);

    // Handle reconnects
    client.on("connect", async (newCredentials) => {
      console.log("League client reconnected. Fetching summoner name...");
      global.credentials = newCredentials; // Update credentials

      // Initialize WebSocket and fetch summoner name on reconnect
      await initializeWebSocket(newCredentials);
      await fetchAndSendSummonerName(newCredentials);
      notifyClientStatus(true);
    });

    // Handle disconnects
    client.on("disconnect", () => {
      console.log("League client disconnected.");
      notifyClientStatus(false);
    });

    client.start();
  } catch (error) {
    console.error("Error setting up monitoring:", error);
  }
}

// Helper function to fetch and send summoner name to renderer
async function fetchAndSendSummonerName(credentials) {
  try {
    currentSummonerResponse = await fetchSummonerNameWithRetry(credentials); // Ensure response is stored
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send("summoner-name-response", currentSummonerResponse);
    }
  } catch (error) {
    console.error("Error fetching and sending summoner name:", error);
  }
}

// Helper to notify client status to renderer
function notifyClientStatus(isConnected) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("client-status", { connected: isConnected });
  }
}


setupLeagueClientMonitoring();

ipcMain.handle("get-current-game-phase", async () => {
  try {
    const credentials = await authenticate({ awaitConnection: false });
    const { port, password } = credentials;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Ignore TLS verification for local requests

    const response = await fetch(
      `https://127.0.0.1:${port}/lol-gameflow/v1/gameflow-phase`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${password}`).toString(
            "base64"
          )}`,
          Accept: "application/json",
        },
      }
    );

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1"; // Restore TLS verification after request

    if (response.ok) {
      const currentPhase = await response.json();
      return currentPhase; // Return the current phase
    } else {
      throw new Error(`Failed to fetch game phase. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching game phase:", error);
    return null; // Return null or a default value in case of error
  }
});

ipcMain.handle("check-client-status", async (event) => {
  try {
    await authenticate({ awaitConnection: false });
    return { connected: true };
  } catch (error) {
    return { connected: false, reason: error.message };
  }
});

ipcMain.on("get-summoner-name", async (event) => {
  if (currentSummonerResponse) {
    console.log("Summoner data available, sending cached data...", currentSummonerResponse);
    event.reply("summoner-name-response", currentSummonerResponse); // Send full response
  } else {
    console.log("No summoner data available, fetching new data...");
    const newCredentials = global.credentials; // Assuming credentials are stored globally
    if (newCredentials) {
      console.log("Fetching summoner name with credentials:", newCredentials);
      currentSummonerResponse = await fetchSummonerName(newCredentials);
      event.reply("summoner-name-response", currentSummonerResponse); // Send the full object
    } else {
      console.error("No credentials available to fetch summoner data.");
      event.reply("summoner-name-response", null);
    }
  }
});

ipcMain.handle("get-api-key", async (event) => {
  debug("IPC message received: get-api-key");

  return process.env.RIOT_API_KEY;
});

let currentSummonerResponse = null;
async function fetchSummonerName(credentials) {
  const { port, password } = credentials;

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Disable TLS cert verification for this request

  try {
    // Fetch current summoner data
    const summonerResponse = await fetch(
      `https://127.0.0.1:${port}/lol-summoner/v1/current-summoner`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${password}`).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );

    if (!summonerResponse.ok) {
      console.error(`HTTP error fetching summoner name: ${summonerResponse.status}`);
      return null;
    }

    const summonerData = await summonerResponse.json();
    if (!summonerData || !summonerData.gameName) {
      console.error("Neither gameName nor displayName found in the API response");
      return null;
    }

    // Fetch region data from /riotclient/region-locale
    const regionResponse = await fetch(
      `https://127.0.0.1:${port}/riotclient/region-locale`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${password}`).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );

    if (!regionResponse.ok) {
      console.error(`HTTP error fetching region data: ${regionResponse.status}`);
      return null;
    }

    const regionData = await regionResponse.json();
    if (!regionData || !regionData.region) {
      console.error("Region information not found in the API response");
      return null;
    }

    // Combine summoner data with region information
    const combinedResponse = {
      ...summonerData,
      region: regionData.region,
    };

    console.log("Summoner and region data fetched:", combinedResponse); // Log the combined data

    // Update the global currentSummonerResponse with the full data including region
    currentSummonerResponse = combinedResponse;

    return combinedResponse; // Return the full object with region included

  } catch (error) {
    console.error("Error fetching summoner or region data:", error);
    return null;
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1"; // Reset TLS verification
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const allDisplays = screen.getAllDisplays();
  const externalDisplay = allDisplays.find(
    (display) => display.bounds.x > primaryDisplay.bounds.x
  );

  let x = 0,
    y = 0;

  if (externalDisplay) {
    x = externalDisplay.bounds.x; // +50 for a slight offset from the corner
    y = externalDisplay.bounds.y + 50;
  }

  debug("Creating main window");
  mainWindow = new BrowserWindow({
    x: x,
    y: y,
    minWidth: 1850, // set the minimum width 1600
    minHeight: 900, // set the minimum height 800
    title: "SoloQ", // Set your desired title here
    icon: path.join(__dirname, 'iconApp.png'), // Path to your custom icon
    width: 2560,
    height: 1240,
    // maxHeight: 800,
    // maxWidth: 1280,
    partition: "nopersist",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // Keep it true for security
      nodeIntegration: false, // Node integration should be false in renderer for security
    },
  });

  // Open the DevTools automatically if in development environment
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    mainWindow.webContents.openDevTools();
  }

  debug("Loading main window");
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    log.info(
      "Loading main window from file",
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindowReady = true;
    isAppStartup = false;

    // Now that mainWindow is ready, check if there are any queued messages
    // and send them to the renderer. This part depends on how you decide to queue messages.
  });
}

updater.logger = require("electron-log");
updater.logger.transports.file.level = "info";
let mainWindowReady = false;

ipcMain.on("start-download", (event) => {
  updater.downloadUpdate();
});

updater.on("error", (err) => {
  log.info("Inside updater.on('error')");
  log.error("Error in auto-updater.", err);
  dialog.showErrorBox(
    "Update Error",
    "An error occurred while updating the application. " + err
  );
});

// Notify the renderer about the update progress
updater.on("download-progress", (progressObj) => {
  log.info("Inside updater.on('download-progress')");

  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message += " - Downloaded " + progressObj.percent + "%";
  log_message += " (" + progressObj.transferred + "/" + progressObj.total + ")";
  log.info(log_message);
  if (mainWindowReady && mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("download-progress", progressObj);
  }
});

let queuedMessages = [];

function processQueuedMessages() {
  queuedMessages.forEach((message) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send(message.type, message.info);
    }
  });
  // Clear the queue after processing
  queuedMessages = [];
}

updater.on("update-available", (info) => {
  log.info("Update available.", info);
  if (mainWindowReady && mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("update-available", info);
  }
  // } else {
  //   // Queue the message or handle it according to your app's logic
  //   queuedMessages.push({ type: "update-available", info: info });
  // }
});

// updater.on("update-not-available", (info) => {
//   log.info("Update not available.", info);
//   mainWindow.webContents.send("current-release", info);
// });

updater.on("update-error", (error) => {
  if (mainWindowReady && mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("update-error", error);
  }
  dialog.showErrorBox(
    "Error: ",
    error == null ? "unknown" : (error.stack || error).toString()
  );
});

// Notify the renderer when an update is downloaded and ready to be installed
// updater.on("update-downloaded", (info) => {
//   log.info("Update downloaded.", info);
//   mainWindow.webContents.send("update-downloaded", info);
// });

ipcMain.on("restart-app-to-update", () => {
  updater.quitAndInstall();
});

ipcMain.on("check-for-updates", () => {
  // autoUpdater.checkForUpdates();
  // updater.checkForUpdates();
  log.info("Checking for updates...");
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    log.info("In development mode, skipping update checks.");
    // In development, skip update checks and directly initialize the app
    updater.checkForUpdates();
    return;
  }
  updater.checkForUpdatesAndNotify();
});

// Renderer sends this after user confirmation
ipcMain.on("confirm-update-installation", () => {
  updater.quitAndInstall();
});

async function checkForUpdatesAndInitialize() {
  log.info("Current environment:", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    // In development, skip update checks and directly initialize the app
    log.info("In development mode, skipping update checks.");
    if (!mainWindow) {
      createMainWindow();
    }
    return;
  }

  // Production environment, proceed with update checks
  updater.on("update-downloaded", (info) => {
    if (isAppStartup) {
      // It's safe to restart and install the update immediately during startup
      log.info("Update downloaded at startup. Will quit and install:", info);
      updater.quitAndInstall();
    } else {
      // During app usage, ask the user for confirmation
      log.info("Update downloaded during app usage.", info);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-downloaded", info);
      }
    }
  });

  updater.on("update-not-available", (info) => {
    log.info("No update available. Proceeding with app initialization:", info);
    if (!mainWindow) {
      createMainWindow();
    }
  });

  try {
    await updater.checkForUpdatesAndNotify();
  } catch (error) {
    log.error("Error in auto-updater:", error);
    if (!mainWindow) {
      createMainWindow();
    }
  }
}

app.on("ready", async () => {
  debug("checking for updates");
  checkForUpdatesAndInitialize();
  debug("App is ready");
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  debug("All windows closed");

  if (process.platform !== "darwin") {
    app.quit();
  }
});

// // Check if the main window is open
// function isMainWindowOpen() {
//   console.log('Main window is open');
//   return mainWindow !== null;
// }

// You can periodically call isMainWindowOpen() to check if the window is open
// setInterval(() => {
//   if (isMainWindowOpen()) {
//     console.log('Main window is open');
//   } else {
//     console.log('Main window is closed');
//   }
// }, 5000); // Check every 5 seconds, adjust the interval as needed

app.on("activate", () => {
  debug("App is activated");
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// websocket
const debouncedChampionAction = debounce((championId, completed) => {
  if (completed) {
    mainWindow.webContents.send("champion-picked", { championId });
    log.info(`Summoner has picked champion ID: ${championId}`);
  } else {
    mainWindow.webContents.send("champion-selected", { championId });
    log.info(`Summoner is selecting champion ID: ${championId}`);
  }
}, 250);

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export { mainWindow };
