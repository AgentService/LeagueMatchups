// utilities.js
import Debug from "debug";
import store from "../../store"; // Adjust the path according to your project structure

const debug = Debug("app:store:utilities");

/**
 * Validates the API response.
 * @param {Object} response - The response from the API.
 * @returns {Object} - The response data if valid.
 * @throws {Error} - If the response status is not valid.
 * @exampleUsage in store/modules/utilities.js
 */
export function validateApiResponse(response) {
  const validStatusCodes = [200, 201, 204];

  if (!validStatusCodes.includes(response.status)) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }

  // Additional validation can be added here

  return response.data;
}

/**
 * Handles errors that occur during API requests.
 * @param {Object} error - The error object.
 * @returns {null} - Returns null or any appropriate value on error.
 * @throws {Error} - If the error needs to be rethrown.
 */
export function handleApiError(error) {
  debug("API Request error:", error);
  // Additional error handling logic can be added here

  // Return a default value or rethrow the error as needed
  return null;
}

/**
 * Gets the auth config object for API requests.
 * @returns {Object} - The auth config object.
 * @throws {Error} - If the token is not available.
 * @exampleUsage in store/modules/matchups.js
 */
export function getAuthConfig() {
  // Retrieve the token from Vuex state
  const token = store.state.auth.token; // Assuming your auth token is stored in the auth module's state

  if (!token) {
    throw new Error("Token not available");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
