const fs = require('fs');
const { ipcMain, app, BrowserWindow, screen, dialog } = require("electron");
const { autoUpdater } = require('electron-updater');

const log = require("electron-log");
const path = require("path");
require("dotenv").config();
const Debug = require("debug");
const debug = Debug("app:main");
const findProcess = require("find-process");

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

ipcMain.handle("check-client-status", async () => {
  const detectionMethod = store.get("detectionMethod", "process"); // Fallback to 'lockfile' if not set
  switch (detectionMethod) {
    case "lockfile":
      return await checkLockfileExists(); // Your existing lockfile check logic
    case "process":
      return await checkLeagueClientProcess(); // New method to implement
    default:
      console.error("Invalid detection method.");
      return false;
  }
});

async function checkLeagueClientProcess() {
  try {
    const processes = await findProcess("name", "LeagueClientUx.exe");
    if (processes.length > 0) {
      const riotCredentials = await getLeagueClientCredentials();
      return riotCredentials;
    }
    return false;
  } catch (error) {
    console.error("Error checking League client process:", error);
    return false;
  }
}

async function getLeagueClientCredentials() {
  const processes = await findProcess("name", "LeagueClientUx.exe");
  for (const proc of processes) {
    const cmd = proc.cmd || ""; // Command line string
    const portMatch = cmd.match(/--app-port=(\d+)/);
    const tokenMatch = cmd.match(/--remoting-auth-token=([\w-]+)/);

    if (portMatch && tokenMatch) {
      return { port: portMatch[1], token: tokenMatch[1] };
    }
  }
  return null;
}

async function getLeagueClientPathFromProcess() {
  const processes = await findProcess("name", "LeagueClientUx.exe");
  for (const proc of processes) {
    const installDir = extractInstallDirectory(proc.cmd);
    if (installDir) {
      console.log("Extracted Install Directory:", installDir); // Should accurately reflect the full path
      const lockfilePath = path.join(installDir, "lockfile");
      console.log("Constructed Lockfile Path:", lockfilePath);
      if (fs.existsSync(lockfilePath)) {
        console.log("Lockfile found.");
        return lockfilePath;
      } else {
        console.log("Lockfile not found at the constructed path.");
      }
    }
  }
  return null;
}

function extractInstallDirectory(cmd) {
  // Specifically match the --install-directory parameter and capture the full path, accounting for possible spaces within quotes
  const regex = /--install-directory=([^"]+?)"/;
  const match = cmd.match(regex);
  if (match && match[1]) {
    let directoryPath = match[1];
    // Remove leading and trailing quotes if present
    directoryPath = directoryPath.replace(/^"|"$/g, "");
    return directoryPath;
  }
  return null;
}

async function getCredentialsFromLockfile(lockfilePath) {
  const lockfileContent = fs.readFileSync(lockfilePath, "utf8");
  const parts = lockfileContent.split(":");
  if (parts.length >= 4) {
    const port = parts[2];
    const token = parts[3];
    return { port, token };
  }
  return null;
}

ipcMain.on("get-summoner-name", async (event, selectedPath = null) => {
  console.log("IPC message received: get-summoner-name");
  let summonerName = null;
  // const summonerName = await getSummonerName(selectedPath);
  try {
    const lockfilePath = await getLeagueClientPathFromProcess();
    if (!lockfilePath) {
      throw new Error("League client lockfile not found.");
    }

    const credentials = await getCredentialsFromLockfile(lockfilePath);
    if (!credentials) {
      throw new Error("Failed to extract credentials from lockfile.");
    }

    summonerName = await fetchSummonerName(credentials.port, credentials.token);
    if (summonerName) {
      console.log("Fetched Summoner Name:", summonerName);
      console.log("credentials", credentials);
    } else {
      console.log("Summoner name could not be fetched.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
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

async function fetchSummonerName(port, token) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Important: Ensure this is acceptable for your app's security requirements

  try {
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

    const response = await fetch(
      `https://127.0.0.1:${port}/lol-summoner/v1/current-summoner`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${token}`).toString(
            "base64"
          )}`,
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Summoner Name:", data.displayName);
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

autoUpdater.on("error", (err) => {
  log.error("Error in auto-updater.", err);
  dialog.showErrorBox('Update Error', 'An error occurred while updating the application. ' + err);
});

ipcMain.on('checking-for-update"', () => {
  autoUpdater.checkForUpdatesAndNotify().then(() => {
    dialog.showMessageBox({
      title: 'Check for Updates',
      message: 'Update check completed. If an update is available, it will be downloaded automatically.'
    });
  }).catch(err => {
    dialog.showErrorBox('Update Check Failed', 'Failed to check for updates: ' + err);
  });
});

// Notify the renderer about the update progress
autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message += " - Downloaded " + progressObj.percent + "%";
  log_message += " (" + progressObj.transferred + "/" + progressObj.total + ")";
  log.info(log_message);
  mainWindow.webContents.send("download-progress", progprogressObjress);
});

// Inform the renderer that an update is available
autoUpdater.on("update-available", () => {
  log.info("Update available.", info);
  mainWindow.webContents.send("update-available");
});

autoUpdater.on("update-not-available", (info) => {
  log.info("Update not available.", info);
});

autoUpdater.on("update-error", (error) => {
  mainWindow.webContents.send("update-error", error);
  dialog.showErrorBox(
    "Error: ",
    error == null ? "unknown" : (error.stack || error).toString()
  );
});

// Notify the renderer when an update is downloaded and ready to be installed
autoUpdater.on("update-downloaded", (info) => {
  log.info('Update downloaded; will install in 5 seconds', info);
  mainWindow.webContents.send("update-downloaded");
});

ipcMain.on("restart-app-to-update", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on("check-for-updates", () => {
  // autoUpdater.checkForUpdates();
  autoUpdater.checkForUpdatesAndNotify();
});

// Renderer sends this after user confirmation
ipcMain.on("confirm-update-installation", () => {
  autoUpdater.quitAndInstall();
});

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
  //   setInterval(() => {
  //     mainWindow.webContents.send("update-available");
  //   }, 10000); // Emit 'update-available' every 10 seconds

  //   setInterval(() => {
  //     mainWindow.webContents.send("update-downloaded");
  //   }, 10000); // Emit 'update-downloaded' every 10 seconds, starting 10 second
  // autoUpdater.checkForUpdatesAndNotify();
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
