const { ipcMain, app, BrowserWindow, screen, dialog } = require("electron");
const fs = require("fs");
const {
  createWebSocketConnection,
  authenticate,
  LeagueClient,
} = require("league-connect");

const { autoUpdater } = require("electron-updater");
const EventEmitter = require("events");

autoUpdater.channel = "alpha";

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

let mainWindow;

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
      setupWebSocketSubscriptions(ws);
    }
  } catch (error) {
    debug("League client not detected or WebSocket connection failed:", error);
  }
}

function setupWebSocketSubscriptions(ws) {
  ws.subscribe("/lol-summoner/v1/current-summoner", (data) => {
    if (data && data.type === "Update") {
      console.log(`The summoner ${data.data.displayName} was updated.`);
      // Here you can update your application's state or UI based on the received summoner information
    }
  });

  let lastChampionId = null;
  let lastActionCompleted = false;

  ws.subscribe("/lol-champ-select/v1/session", (sessionData) => {
    const summonerAction = sessionData.actions.flat().find((action) => {
      return (
        action.actorCellId ===
        sessionData.myTeam.find(
          (member) => member.puuid === currentSummoner.puuid
        )?.cellId
      );
    });
    debug("summonerAction", summonerAction);
    if (summonerAction && summonerAction.type === "pick") {
      debug("summonerAction", summonerAction);
      const championIdChanged = summonerAction.championId !== lastChampionId;
      const actionCompletedChanged =
        summonerAction.completed !== lastActionCompleted;

      if (championIdChanged || actionCompletedChanged) {
        lastChampionId = summonerAction.championId;
        lastActionCompleted = summonerAction.completed;
        debug("lastChampionId", lastChampionId);
        debouncedChampionAction(
          summonerAction.championId,
          summonerAction.completed
        );
      }
    }
  });
}
async function setupLeagueClientMonitoring() {
  log.info("ENV", process.env);
  try {
    const credentials = await authenticate({
      awaitConnection: true,
      pollInterval: 2500,
    });
    console.log("League client found. Credentials obtained.");

    initializeWebSocket(credentials)
      .then(() => {
        fetchSummonerName(credentials).catch(console.error);
      })
      .catch(console.error);
    const client = new LeagueClient(credentials, { pollInterval: 1000 });
    mainWindow.webContents.send("client-status", { connected: true });

    client.on("connect", (newCredentials) => {
      console.log("League client connected.");
      initializeWebSocket(newCredentials)
        .then(() => {
          fetchSummonerName(newCredentials).catch(console.error);
          mainWindow.webContents.send("client-status", { connected: true });
        })
        .catch(console.error);
    });
    client.on("disconnect", () => {
      console.log("League client disconnected.");
      mainWindow.webContents.send("client-status", { connected: false });
    });
    client.start();
  } catch (error) {
    console.error("Error setting up monitoring:", error);
  }
}

setupLeagueClientMonitoring();

ipcMain.handle("check-client-status", async (event) => {
  try {
    await authenticate({ awaitConnection: false });
    return { connected: true };
  } catch (error) {
    return { connected: false, reason: error.message };
  }
});

ipcMain.on("get-summoner-name", async (event) => {
  event.reply("summoner-name-response", currentSummoner);
});

ipcMain.handle("get-api-key", async (event) => {
  debug("IPC message received: get-api-key");

  return process.env.RIOT_API_KEY;
});

let currentSummoner = null;

async function fetchSummonerName(credentials) {
  const { port, password } = credentials;
  debug("Fetching summoner name...", port, password);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Important: Ensure this is acceptable for your app's security requirements

  try {
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

    const response = await fetch(
      `https://127.0.0.1:${port}/lol-summoner/v1/current-summoner`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${password}`).toString(
            "base64"
          )}`,
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      currentSummoner = data;
      return data.displayName;
    } else {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching summoner name:", error);
    return null;
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1"; // Reset for safety
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
    minWidth: 1600, // set the minimum width 1600
    minHeight: 800, // set the minimum height 800
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
  clog.info("Inside updater.on('download-progress')");

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
  updater.checkForUpdates();
});

// Renderer sends this after user confirmation
ipcMain.on("confirm-update-installation", () => {
  updater.quitAndInstall();
});

async function checkForUpdatesAndInitialize() {
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    // In development, skip update checks and directly initialize the app
    log.info("In development mode, skipping update checks.");
    createMainWindow();
    return;
  }

  // Production environment, proceed with update checks
  updater.on("update-downloaded", (info) => {
    log.info("Update downloaded. Will quit and install:", info);
    updater.quitAndInstall();
  });

  updater.on("update-not-available", (info) => {
    log.info("No update available. Proceeding with app initialization:", info);
    createMainWindow();
  });

  try {
    await updater.checkForUpdatesAndNotify();
  } catch (error) {
    log.error("Error in auto-updater:", error);
    createMainWindow(); // Proceed to create the main window even if update check fails
  }
}

app.on("ready", async () => {
  debug("checking for updates");
  checkForUpdatesAndInitialize();
  debug("App is ready");
});

mainWindow.once("ready-to-show", () => {
  mainWindowReady = true;
  // Now that mainWindow is ready, check if there are any queued messages
  // and send them to the renderer. This part depends on how you decide to queue messages.
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
    debug(`Summoner has picked champion ID: ${championId}`);
  } else {
    mainWindow.webContents.send("champion-selected", { championId });
    debug(`Summoner is selecting champion ID: ${championId}`);
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
