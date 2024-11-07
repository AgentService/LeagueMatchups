import ImageUrlHelper from "./utils/imageHelper.js";

let urlHelper;

export async function setupBaseUrl() {
  urlHelper = new ImageUrlHelper();
}

export function getUrlHelper() {
  if (!urlHelper) {
    console.warn("urlHelper is being initialized lazily");
    urlHelper = new ImageUrlHelper(); // Initialize immediately if not yet defined
  }
  return urlHelper;
}

