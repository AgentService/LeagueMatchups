// summonerDataService.js
import store from "../store/index"; // Import the store directly
import Debug from "debug";
const debug = Debug("app:services:summoner-data");

// Function that invokes the fetching of summoner data
export async function fetchAndSaveSummonerData(summonerNameValue) {
  try {
    console.log("Fetching summoner data for:", summonerNameValue);
    if (summonerNameValue) {
      debug("Fetching summoner data for:", summonerNameValue);
      await store.dispatch("summoner/fetchSummonerData", {
        region: "europe",
        gameName: summonerNameValue,
        tagLine: "euw1",
      });
    }
  } catch (error) {
    console.error("Error fetching and saving summoner data:", error);
  }
}

/**
 * The function initializes data fetching for a summoner's name and checks if the summoner data already
 * exists before fetching and saving new data.
 */
export function initializeSummonerDataFetching() {
  window.api.receive("summoner-name-response", async (response) => {
    // Check if the response contains a valid summoner name and no error
    if (response && response.displayName && !response.error) {
      const newSummonerName = response.displayName;
      debug("New summoner name:", newSummonerName);
      const summonerData =
        store.getters["summoner/getSummonerDataByName"](newSummonerName);

      if (!summonerData) {
        debug("Fetching summoner data for:", newSummonerName);
        // Assuming fetchAndSaveSummonerData is an async function that fetches
        // and then updates the store with the new summoner data.
        await fetchAndSaveSummonerData(newSummonerName);
      } else {
        debug("Summoner data already exists for:", newSummonerName);
      }
    } else {
      // Handle cases where summoner name couldn't be fetched or an error occurred
      debug("Error fetching summoner name:", response.error);
      // Optionally, request the user to specify the path manually or show an error message
    }
  });
  window.api.send("get-summoner-name");
}

/*
 * The function checks for the summoner name every hour and fetches the data if it doesn't exist.
 */
function checkSummonerName() {
  console.log("Checking summoner name");
  window.api.send("get-summoner-name");
}

// Function to start checking for Summoner Name every minute
export function startSummonerNameCheck() {
  const intervalId = setInterval(checkSummonerName, 3600000); // 3600000 milliseconds = 1 minute 3600000

  // Optionally, you can store intervalId to clear it later when needed
  localStorage.setItem("summonerNameCheckIntervalId", intervalId.toString());
}

// Function to stop checking for Summoner Name
export function stopSummonerNameCheck() {
  const intervalId = localStorage.getItem("summonerNameCheckIntervalId");
  if (intervalId) {
    clearInterval(parseInt(intervalId));
    localStorage.removeItem("summonerNameCheckIntervalId");
  }
}
