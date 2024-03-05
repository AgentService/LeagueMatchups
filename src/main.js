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
store.set("leagueClientPath", null); // Returns null if not found

// Function to recursively search for a file in a directory
function searchForFile(directory, targetFile, maxDepth = 5, currentDepth = 0) {
  if (currentDepth > maxDepth) return null;

  const files = fs.readdirSync(directory, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    if (file.isDirectory()) {
      const result = searchForFile(
        fullPath,
        targetFile,
        maxDepth,
        currentDepth + 1
      );
      if (result) return result;
    } else if (file.name === targetFile) {
      return fullPath;
    }
  }
  return null;
}

function saveLeagueClientPath(leagueClientPath) {
  store.set("leagueClientPath", leagueClientPath);
}

function loadLeagueClientPath() {
  return store.get("leagueClientPath", null); // Returns null if not found
}

// Enhanced League client path discovery
ipcMain.handle("find-league-client-path", async (event) => {
  const leagueClientPath = await findLeagueClientPath();
  event.reply("league-client-path-found", leagueClientPath);
});

// Adjust the openDirectoryPicker function
async function openDirectoryPicker(event) {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    // mainWindow is used here
    properties: ["openDirectory"],
    parent: mainWindow, // Make the dialog modal to the main window
    modal: true, // This is optional depending on your needs
  });
  if (!canceled && filePaths.length > 0) {
    const directoryPath = filePaths[0];
    const leagueClientPath = path.join(directoryPath, "LeagueClient.exe"); // Look for LeagueClient.exe

    if (fs.existsSync(leagueClientPath)) {
      console.log("League client found:", leagueClientPath);
      // Save the path up to the directory containing the executable
      saveLeagueClientPath(path.dirname(leagueClientPath));
      mainWindow.webContents.send("directory-path-selected", {
        leagueClientPath: path.dirname(leagueClientPath), // Correctly set to the directory
        directoryPath,
      });
    } else {
      console.log("League client not found in the selected directory.");
      mainWindow.webContents.send("directory-path-selected", {
        leagueClientPath: null,
        directoryPath: null,
      });
    }
  }
  event.reply("directory-path-selected", null);
}

// Enhanced function to find the League client path
async function findLeagueClientPath() {
  // First, check the predefined paths
  for (const predefinedPath of LEAGUE_CLIENT_PATHS) {
    if (fs.existsSync(predefinedPath)) {
      console.log(`Lockfile found at: ${predefinedPath}`);
      return predefinedPath;
    }
  }

  // If not found, scan common directories
  const commonPaths = [
    "C:/Program Files/",
    "C:/Program Files (x86)/",
    "/Applications/",
    // Add other common paths as needed
  ];
  for (const commonPath of commonPaths) {
    if (fs.existsSync(commonPath)) {
      const leaguePath = searchForFile(commonPath, "LeagueClient.exe"); // Example for Windows
      if (leaguePath) {
        console.log(`League client found at: ${leaguePath}`);
        return leaguePath.replace(/LeagueClient\.exe$/, ""); // Adjust accordingly for macOS or other files
      }
    }
  }
  console.log("League client not found.");
  return null;
}

// Assuming 'open-path-dialog' is triggered after the Vue component popup interaction
ipcMain.on("open-path-dialog", (event) => {
  openDirectoryPicker(event);
});

ipcMain.handle("check-league-client-path-exists", async () => {
  const leagueClientPath = loadLeagueClientPath(); // This function should retrieve the saved path
  if (typeof leagueClientPath !== "string") {
    console.error(
      "League client path is not set or invalid:",
      leagueClientPath
    );
    return false; // Indicate failure or absence of the path
  }

  const leagueClientExePath = path.join(leagueClientPath, "LeagueClient.exe");
  return fs.existsSync(leagueClientExePath);
});

ipcMain.handle("check-lockfile-exists", async () => {
  const leagueClientPath = loadLeagueClientPath(); // Assume this now loads the general client path
  if (typeof leagueClientPath !== "string") {
    console.error(
      "League client path is not set or invalid:",
      leagueClientPath
    );
    return false; // Similarly handle the case for the lockfile check
  }

  const lockfilePath = path.join(leagueClientPath, "lockfile");
  return fs.existsSync(lockfilePath);
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
  let leagueClientPath = selectedPath || loadLeagueClientPath(); // Update to use the correct function name

  console.log("Attempting to use League client path:", leagueClientPath);
  let lockfilePath = leagueClientPath
    ? path.join(leagueClientPath, "lockfile")
    : null;

  // Check if the lockfile exists at the constructed path
  if (lockfilePath && fs.existsSync(lockfilePath)) {
    console.log("Lockfile found at:", lockfilePath);
  } else {
    console.log("Lockfile not found. Ensure the League client is running.");
    return null; // Exit if the lockfile is not found
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
