// globalSetup.js
import ImageUrlHelper from "./utils/imageHelper.js";

let urlHelper;

export async function setupBaseUrl() {
  urlHelper = new ImageUrlHelper();
}

export function getUrlHelper() {
  return urlHelper;
}
