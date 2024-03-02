import fs from "fs";
import { ipcMain, app, BrowserWindow, screen, dialog } from "electron";
import path from "path";
require("dotenv").config();
const Debug = require("debug");
const debug = Debug("app:main");

const Store = require("electron-store");
const store = new Store();

const isDevelopment = process.env.NODE_ENV === "development";
const basePath = isDevelopment
  ? path.join(__dirname, "..", "public", "img")
  : path.join(process.resourcesPath, "app", "public", "img");

ipcMain.handle("get-base-url", () => `file://${basePath}`);

console.log("env:", import.meta.env.DEV);
console.log("dirname", __dirname);
console.log("basePath", basePath);
console.log("NODE_ENV", process.env.NODE_ENV);

let mainWindow;

const LEAGUE_CLIENT_PATHS = [
  "C:/Riot Games/League of LegendsX/lockfile",
  "/Applications/League of Legends.app/Contents/LoL/lockfile",
  "C:/Program Files/Riot Games/League of Legends/lockfile",
];

function saveLockfilePath(lockfilePath) {
  store.set("lockfilePath", lockfilePath);
}

function loadLockfilePath() {
  return store.get("lockfilePath", null); // Returns null if not found
}

// Function to open the directory picker
async function openDirectoryPicker(event) {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    // mainWindow is used here
    properties: ["openDirectory"],
    parent: mainWindow, // Make the dialog modal to the main window
    modal: true, // This is optional depending on your needs
  });

  if (!canceled && filePaths.length > 0) {
    const directoryPath = filePaths[0];
    const lockfilePath = path.join(directoryPath, "lockfile"); // Assuming 'lockfile' is the filename

    if (fs.existsSync(lockfilePath)) {
      console.log("Lockfile found:", lockfilePath);
      saveLockfilePath(lockfilePath); // Save the direct lockfile path
      mainWindow.webContents.send("directory-path-selected", {
        lockfilePath,
        directoryPath,
      });
    } else {
      console.log("Lockfile not found in the selected directory.");
      mainWindow.webContents.send("directory-path-selected", {
        directoryPath: null,
        lockfilePath: null,
      });
    }
  } else {
    // Handle cancellation or no selection
    event.reply("directory-path-selected", null);
  }
}

async function findLockfilePath() {
  for (const path of LEAGUE_CLIENT_PATHS) {
    if (fs.existsSync(path)) {
      console.log(`Lockfile found at: ${path}`);
      const savedPath = store.get("lockfilePath", null);
      if (path !== savedPath) {
        console.log("New lockfile path found, updating Electron Store...");
        store.set("lockfilePath", path);
      }
      return path;
    }
  }
  console.log("Lockfile not found in standard locations.");
  return null;
}

// Assuming 'open-path-dialog' is triggered after the Vue component popup interaction
ipcMain.on("open-path-dialog", (event) => {
  openDirectoryPicker(event);
});

ipcMain.handle("check-lockfile-exists", async () => {
  const savedLockfilePath = loadLockfilePath();
  return savedLockfilePath && fs.existsSync(savedLockfilePath);
});

ipcMain.on("get-summoner-name", async (event, selectedPath = null) => {
  console.log("IPC message received: get-summoner-name");
  const summonerName = await getSummonerName(selectedPath); // Pass the selectedPath if provided

  if (summonerName) {
    console.log("Summoner Name:", summonerName);
    event.reply("summoner-name-response", summonerName);
  } else {
    event.reply("summoner-name-response", null);
  }
});

ipcMain.handle("get-api-key", async (event) => {
  debug("IPC message received: get-api-key");

  return process.env.RIOT_API_KEY;
});

async function getSummonerName(selectedPath = null) {
  // First, try to get the lockfile path from Electron Store
  let lockfilePath = selectedPath || store.get("lockfilePath", null);

  console.log("Attempting to use lockfile path:", lockfilePath);

  // Check if the stored path is valid (exists and contains the lockfile)
  if (lockfilePath && fs.existsSync(lockfilePath)) {
    console.log("Using lockfile path from Electron Store:", lockfilePath);
  } else {
    console.log("Stored lockfile path not valid. Searching standard paths...");
    lockfilePath = await findLockfilePath();

    if (!lockfilePath) {
      console.log("No lockfile path available.");
      return null; // Exit if lockfile not found in standard paths either
    }
  }

  // Function to attempt fetching summoner name from a given path
  async function attemptFetchSummonerNameFromPath(lockfilePath) {
    if (!fs.existsSync(lockfilePath)) {
      console.log(`League client not found at ${lockfilePath}.`);
      return null; // Indicate that the path did not contain the lockfile
    }

    console.log("League client found at:", lockfilePath);
    let previousValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

    try {
      console.log("Reading lockfile");
      const lockfileContent = fs.readFileSync(lockfilePath, "utf8");
      const [, , port, token] = lockfileContent.split(":");
      console.log("Port:", port);
      console.log("Token:", token);

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
        console.log("Summoner Name:", data.displayName);
        return data.displayName;
      }

      console.error(`HTTP error! status: ${response.status}`);
      return null; // HTTP error occurred
    } catch (error) {
      console.log(
        `Error retrieving summoner name from ${lockfilePath}:`,
        error
      );
      return null; // Error occurred
    } finally {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousValue;
    }
  }

  return await attemptFetchSummonerNameFromPath(lockfilePath);
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  debug("Electron Squirrel Startup");
  app.quit();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function createWindow(x = 0, y = 0) {
  debug("Creating main window");
  mainWindow = new BrowserWindow({
    x: x,
    y: y,
    minWidth: 1600, // set the minimum width
    minHeight: 800, // set the minimum height
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

app.on("ready", async () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const allDisplays = screen.getAllDisplays();
  const externalDisplay = allDisplays.find(
    (display) => display.bounds.x > primaryDisplay.bounds.x
  );

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
