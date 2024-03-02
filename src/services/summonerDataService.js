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
  window.api.receive("summoner-name-response", async (newSummonerName) => {
    console.log("Summoner name response received:", newSummonerName);

    if (!newSummonerName) {
      console.log(
        "Summoner name not found. Requesting user to specify path manually."
      );
    } else {
      const summonerData =
        store.getters["summoner/getSummonerDataByName"](newSummonerName);

      if (!summonerData) {
        console.log(
          "Summoner data not found. Fetching data for:",
          newSummonerName
        );
        await fetchAndSaveSummonerData(newSummonerName);
      } else {
        console.log(
          "Summoner data already exists. Skipping fetch for:",
          newSummonerName
        );
      }
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
