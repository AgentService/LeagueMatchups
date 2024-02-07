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

// Function to initialize summoner data fetching without timestamp validation
export function initializeSummonerDataFetching() {
  window.api.receive("summoner-name-response", async (newSummonerName) => {
    console.log("Summoner name response:", newSummonerName);
    const summonersData = JSON.parse(
      localStorage.getItem("summonerData") || "[]"
    );
    let summonerExists = summonersData.some(
      (summoner) => summoner.name === newSummonerName
    );

    // If the summoner does not exist in our local data, fetch and save new data
    if (!summonerExists) {
      await fetchAndSaveSummonerData(newSummonerName);
    } else {
      debug("Summoner data already exists. No need to update on app startup.");
    }
  });

  window.api.send("get-summoner-name");
}

function checkSummonerName() {
  console.log("Checking summoner name");
  window.api.send("get-summoner-name");
}

// Function to start checking for Summoner Name every minute
export function startSummonerNameCheck() {
  const intervalId = setInterval(checkSummonerName, 3600000); // 60000 milliseconds = 1 minute 3600000

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
