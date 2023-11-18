// storage.js
import axios from "axios";
//@ts-check

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const VERSION_ENDPOINT = `${baseUrl}/api/utilities/version`; // Adjust the URL as needed

const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


export function isCacheValid(cachedData) {
	const now = Date.now();
	return cachedData && (now - cachedData.timestamp) < cacheDuration;
}


/*
fetchDataAndCache('championData', '/api/champions', '/api/version', 'SET_CHAMPION_DATA', 'local');
fetchDataAndCache('temporaryStats', '/api/tempStats', '/api/version', 'SET_TEMP_STATS', 'session');
*/

/* Fetches data from an API endpoint and caches it. If the data is already cached
 * and is valid, it uses the cached data instead of fetching from the API.
 * 
 * @param {Object} options - The options for fetching and caching data.
 * @param {string} options.type - The type of data being handled (e.g., 'championData').
 * @param {string} options.apiEndpoint - The API endpoint to fetch data from.
 * @param {string} options.vuexMutation - The Vuex mutation type to commit the fetched data.
 * @param {Function} options.commit - The Vuex `commit` function to update the state.
 * @param {string} [options.storageType='local'] - The type of storage to use ('local' or 'session').
 * @param {boolean} [options.skipCacheValidation=false] - Whether to skip cache validation and always fetch new data.
 * @returns {Promise<Object>} A promise that resolves to the fetched (or cached) data.
 */
export async function fetchDataAndCache(options) {
	const {
		type,
		apiEndpoint,
		vuexMutation,
		commit,
		storageType = "local",
		skipCacheValidation = false
	} = options;

	let data = retrieveData(storageType, type);
	const storedVersion = retrieveData(storageType, type + "Version");
	const response = await axios.get(VERSION_ENDPOINT);
	const currentVersion = response.data.version;

	if (!data || currentVersion !== storedVersion || skipCacheValidation) {
		const dataResponse = await axios.get(`${baseUrl}${apiEndpoint}`);
		data = dataResponse.data;
		saveData(storageType, type, data);
		saveData(storageType, type + "Version", currentVersion);
		commit(vuexMutation, data);
	} else {
		// Retrieve and use cached data if it's valid and cache validation is not skipped
		const cachedData = retrieveData(storageType, type);
		if (cachedData) {
			commit(vuexMutation, cachedData);
			data = cachedData; // Update 'data' to be the cached data
		}
	}
	return data;
}


const storageOperations = {
	"local": {
		save: saveToLocalStorage,
		retrieve: retrieveFromLocalStorage,
		remove: removeFromLocalStorage
	},
	"session": {
		save: saveToSessionStorage,
		retrieve: retrieveFromSessionStorage,
		remove: removeFromSessionStorage
	}
	// Add more storage types and their operations as needed
};

// Unified function to save data
/*
function saveUserPreferences(preferences) {
	saveData('local', 'userPreferences', key);
}
function getUserPreferences() {
	return retrieveData('local', 'key');
}
function resetUserPreferences() {
	removeData('local', 'key');
}

SESSION

function saveSessionSettings(settings) {
	saveData('session', 'sessionSettings', key);
}

function getSessionSettings() {
	return retrieveData('session', 'key');
}
*/
export function saveData(storageType, key, value) {
	const operation = storageOperations[storageType]?.save;
	if (operation) {
		operation(key, value);
	} else {
		console.error(`Storage type '${storageType}' not supported for saving.`);
	}
}

// Unified function to retrieve data
export function retrieveData(storageType, key, skipCacheValidation = false) {
	const operation = storageOperations[storageType]?.retrieve;
	if (operation) {
		return operation(key, skipCacheValidation);
	} else {
		console.error(`Storage type '${storageType}' not supported for retrieval.`);
		return null;
	}
}

// Unified function to remove data
export function removeData(storageType, key) {
	const operation = storageOperations[storageType]?.remove;
	if (operation) {
		operation(key);
	} else {
		console.error(`Storage type '${storageType}' not supported for removal.`);
	}
}

// Utility to save data to sessionStorage
export function saveToSessionStorage(key, value) {
	try {
		const stringValue = JSON.stringify(value);
		sessionStorage.setItem(key, stringValue);
	} catch (error) {
		console.error(`Error saving data to sessionStorage for key: ${key}`, error);
	}
}

// Utility to retrieve data from sessionStorage
export function retrieveFromSessionStorage(key) {
	try {
		const stringValue = sessionStorage.getItem(key);
		return stringValue ? JSON.parse(stringValue) : null;
	} catch (error) {
		console.error(`Error retrieving data from sessionStorage for key: ${key}`, error);
		return null;
	}
}

export function removeFromSessionStorage(key) {
	try {
		sessionStorage.removeItem(key);
	} catch (error) {
		console.error(`Error removing data from sessionStorage for key: ${key}`, error);
	}
}

// Utility to save data to sessionStorage
export function saveToLocalStorage(key, value) {
	try {
		const dataToStore = {
			timestamp: Date.now(),
			data: value,
		};
		localStorage.setItem(key, JSON.stringify(dataToStore));
	} catch (error) {
		console.error(`Error saving data to localStorage for key: ${key}`, error);
	}
}

export function retrieveFromLocalStorage(key, skipCacheValidation = false) {
	try {
		const cachedDataString = localStorage.getItem(key);
		if (!cachedDataString) return null;
		const cachedData = JSON.parse(cachedDataString);

		if (skipCacheValidation || isCacheValid(cachedData)) {
			return cachedData.data;
		}
		return null;
	} catch (error) {
		console.error(`Error retrieving data from localStorage for key: ${key}`, error);
		return null;
	}
}


export function removeFromLocalStorage(key) {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.error(`Error removing data from sessionStorage for key: ${key}`, error);
	}
}

// Usage Example
// saveToSessionStorage('summonerData', { summonerName: 'Azateq', otherDetails: '...' });
// const summonerData = retrieveFromSessionStorage('summonerData');
// console.log(summonerData);
