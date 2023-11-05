import fs from 'fs';
import https from 'https';
import { ipcMain, app, BrowserWindow } from 'electron';
import path from 'path';
require('dotenv').config();

// ... other code ...
let mainWindow; // Store a reference to the main window

const LEAGUE_CLIENT_PATH = 'C:/Riot Games/League of Legends/lockfile'; // Adjust if necessary

ipcMain.on('get-summoner-name', async (event) => {
  console.log('IPC message received: get-summoner-name');
  const summonerName = await getSummonerName(); // This function retrieves the summoner name
  console.log('Summoner Name:', summonerName);
  if (summonerName) {
    console.log('Summoner Name:', summonerName);

    // Send the summoner name back to the renderer process
    event.reply('summoner-name-response', summonerName);
  }
});

ipcMain.handle('get-api-key', async (event) => {
  console.log('IPC message received: get-api-key', process.env.RIOT_API_KEY);
  return process.env.RIOT_API_KEY; // Send the API key to the renderer process
});

async function getSummonerName() {
  console.log('Checking for League client...');
  if (!fs.existsSync(LEAGUE_CLIENT_PATH)) {
    console.log('League client lockfile does not exist.');
    return null;
  }
  console.log('League client found.');

  try {
    const lockfileContent = fs.readFileSync(LEAGUE_CLIENT_PATH, 'utf8');
    const [, , port, token] = lockfileContent.split(':');
    console.log('Port:', port);
    console.log('Token:', token);

    // Temporarily allow self-signed certificates
    const previousValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    const response = await fetch(`https://127.0.0.1:${port}/lol-summoner/v1/current-summoner`, {
      headers: { 'Authorization': 'Basic ' + Buffer.from(`riot:${token}`).toString('base64') },
    });

    // Reset the environment variable after the request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousValue;

    if (response.ok) { // response.ok checks for response status 200-299
      const data = await response.json();
      console.log('Summoner Name:', data.displayName);
      return data.displayName;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in getSummonerName:', error);
    // Reset the environment variable if an error occurs
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousValue;
  }
  return null;
}



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const createWindow = () => {
  console.log('createWindow called, initializing BrowserWindow...');

mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 1280, // set the minimum width
    minHeight: 800, // set the minimum height
    // maxHeight: 800,
    // maxWidth: 1280,
    partition: 'nopersist',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

};



app.on('ready', createWindow);


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
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

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});