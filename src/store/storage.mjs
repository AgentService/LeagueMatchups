
// storage.js
const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


export function isCacheValid(cachedData) {
  const now = Date.now();
  return cachedData && (now - cachedData.timestamp) < cacheDuration;
}
// Utility to save data to sessionStorage
export function saveToSessionStorage(key, value) {
  try {
    const stringValue = JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
    console.log(`Data saved for key: ${key}`);
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

// Utility to save data to sessionStorage
export function saveToLocalStorage(key, value) {
  try {
    const dataToStore = {
      timestamp: Date.now(),
      data: value,
    };
    localStorage.setItem(key, JSON.stringify(dataToStore))
    console.log(`Data saved for key: ${key}`);
  } catch (error) {
    console.error(`Error saving data to sessionStorage for key: ${key}`, error);
  }
}

// Utility to retrieve data from sessionStorage
export function loadFromLocalStorage(key) {
  try {
    const cachedDataString = localStorage.getItem(key);
    if (!cachedDataString) return null;
    const cachedData = JSON.parse(cachedDataString);
    return isCacheValid(cachedData) ? cachedData.data : null;
  } catch (error) {
    console.error(`Error retrieving data from sessionStorage for key: ${key}`, error);
    return null;
  }
}

// Usage Example
// saveToSessionStorage('summonerData', { summonerName: 'Azateq', otherDetails: '...' });
// const summonerData = retrieveFromSessionStorage('summonerData');
// console.log(summonerData);
