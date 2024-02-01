import fs from "fs";
import { ipcMain, app, BrowserWindow, screen } from "electron";
import path from "path";
require("dotenv").config();
const Debug = require("debug");
const debug = Debug("app:main");
console.log("env:", import.meta.env.DEV);

const LEAGUE_CLIENT_PATHS = [
  "C:\\Riot Games\\League of Legends",
  "C:\\Program Files\\Riot Games\\League of Legends",
];

const isDevelopment = process.env.NODE_ENV === "development";
const basePath = isDevelopment
  ? path.join(__dirname, "..", "public", "img")
  : path.join(process.resourcesPath, "app", "public", "img");

ipcMain.handle("get-base-url", () => `file://${basePath}`);

let mainWindow; // Store a reference to the main window

async function findLeagueClientPath() {
  debug("Searching for League client...");
  for (const basePath of LEAGUE_CLIENT_PATHS) {
    try {
      const lockfilePath = path.join(basePath, "lockfile");
      if (await fs.access(lockfilePath, fs.constants.F_OK)) {
        debug(`League client found at ${basePath}`);
        return basePath; // Return the path where the lockfile is found
      }
    } catch (error) {
      // If the lockfile doesn't exist in the current path, catch the error and continue the loop
      debug(`League client not found at ${basePath}`);
    }
  }
  debug("League client not found.");
  return null; // Return null if the client is not found in any of the paths
}

ipcMain.on("get-summoner-name", async (event) => {
  debug("IPC message received: get-summoner-name");
  const summonerName = await getSummonerName(); // This function retrieves the summoner name
  if (summonerName) {
    console.log("Summoner Name:", summonerName);
    // Send the summoner name back to the renderer process
    event.reply("summoner-name-response", summonerName);
  } else {
    // Send an error message back to the renderer process
    event.reply("summoner-name-response", null);
  }
});

ipcMain.handle("get-api-key", async (event) => {
  debug("IPC message received: get-api-key");
  return process.env.RIOT_API_KEY; // Send the API key to the renderer process
});

async function getSummonerName() {
  debug("Retrieving summoner name");
  const leagueClientPath = await findLeagueClientPath();
  if (!leagueClientPath) {
    debug("League client not found.");
    return null;
  }

  let previousValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  try {
    debug("Reading lockfile");
    const lockfileContent = fs.readFileSync(LEAGUE_CLIENT_PATH, "utf8");
    const [, , port, token] = lockfileContent.split(":");
    debug("Port:", port);
    debug("Token:", token);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    debug("Fetching summoner name from League client");
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));
    const response = await fetch(
      `https://127.0.0.1:${port}/lol-summoner/v1/current-summoner`,
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(`riot:${token}`).toString("base64"),
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      debug("Summoner Name:", data.displayName);
      return data.displayName;
    } else {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      debug("Connection refused. Is the League client running?");
      // Inform the user that the client cannot be found or is not running
      // You can also dispatch an action to update the UI accordingly
    } else {
      debug("Error retrieving summoner name:", error);
    }
  } finally {
    // Reset the environment variable in the finally block
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousValue;
  }
  return null;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  debug("Electron Squirrel Startup");
  app.quit();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
console.log(__dirname);
function createWindow(x = 0, y = 0) {
  debug("Creating main window");
  mainWindow = new BrowserWindow({
    x: x,
    y: y,
    minWidth: 1280, // set the minimum width
    minHeight: 720, // set the minimum height
    width: 1800,
    height:1200,
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
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

app.on("ready", () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const allDisplays = screen.getAllDisplays();
  const externalDisplay = allDisplays.find((display) => {
    // The right monitor will have an x value greater than the primary display
    return display.bounds.x > primaryDisplay.bounds.x;
  });

  if (externalDisplay) {
    createWindow(externalDisplay.bounds.x + 50, externalDisplay.bounds.y + 50); // +50 for a slight offset from the corner
  } else {
    createWindow(); // Fallback to the primary display if the right monitor is not found
  }
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
    createWindow();
  }
});
