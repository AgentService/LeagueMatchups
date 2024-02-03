import fs from "fs";
import { ipcMain, app, BrowserWindow, screen } from "electron";
import path from "path";
require("dotenv").config();
const Debug = require("debug");
const debug = Debug("app:main");

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
  "C:/Riot Games/League of Legends/lockfile",
  "/Applications/League of Legends.app/Contents/LoL/lockfile",
  "C:/Program Files/Riot Games/League of Legends/lockfile"
];

ipcMain.on("get-summoner-name", async (event) => {
  console.log("IPC message received: get-summoner-name");
  const summonerName = await getSummonerName();

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

async function getSummonerName() {
  for (let path of LEAGUE_CLIENT_PATHS) {
    if (!fs.existsSync(path)) {
      console.log(`League client not found at ${path}.`);

      continue; // Try the next path
    }

    console.log("League client found at:", path);

    let previousValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;

    try {
      console.log("Reading lockfile");

      const lockfileContent = fs.readFileSync(path, "utf8");
      const [, , port, token] = lockfileContent.split(":");

      console.log("Port:", port);
      console.log("Token:", token);

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
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
      throw new Error(`HTTP error! status: ${response.status}`);
      
    } catch (error) {
      console.log(`Error retrieving summoner name from ${path}:`, error);
    } finally {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousValue;
    }
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
function createWindow(x = 0, y = 0) {
  debug("Creating main window");
  mainWindow = new BrowserWindow({
    x: x,
    y: y,
    minWidth: 1280, // set the minimum width
    minHeight: 720, // set the minimum height
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
  const externalDisplay = allDisplays.find(display => display.bounds.x > primaryDisplay.bounds.x);

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
