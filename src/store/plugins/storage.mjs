// storage.js
const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


export function isCacheValid(cachedData) {
	const now = Date.now();
	return cachedData && (now - cachedData.timestamp) < cacheDuration;
}

const storageOperations = {
	'local': {
		save: saveToLocalStorage,
		retrieve: retrieveFromLocalStorage,
		remove: removeFromLocalStorage
	},
	'session': {
		save: saveToSessionStorage,
		retrieve: retrieveFromSessionStorage,
		remove: removeFromSessionStorage
	}
	// Add more storage types and their operations as needed
};

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
