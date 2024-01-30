// globalSetup.js
import ImageUrlHelper from "./utils/imageHelper.js";

let urlHelper;
let baseUrl = "";

export async function setupBaseUrl() {
  if (import.meta.env.MODE === "development") {
    baseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  } else {
    // Ensure ipcRenderer is exposed safely via preload script
    baseUrl = await window.electron.ipcRenderer.invoke("get-base-url");
  }
  urlHelper = new ImageUrlHelper(baseUrl);
}

export function getUrlHelper() {
  return urlHelper;
}

export function getBaseUrl() {
  return baseUrl;
}
