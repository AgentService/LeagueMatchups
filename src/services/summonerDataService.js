// summonerDataService.js
import store from "../store/index"; // Import the store directly
import Debug from "debug";
import axios from "axios";
import { getAuthConfig } from "../store/modules/utilities.js";
const debug = Debug("app:services:summoner-data");
Debug.enable("*");
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Function that invokes the fetching of summoner data
export async function fetchAndSaveSummonerData(summonerNameValue, tagLine, region = "europe", webSocketResponse = null) {
  try {
    console.log("Processing summoner data for:", summonerNameValue, "with tagLine:", tagLine);

    const existingSummoner = store.getters['summoner/getSummonerDataByName'](summonerNameValue);

    if (!existingSummoner || !existingSummoner.apiResponse) {
      console.log("Fetching additional data from API for:", summonerNameValue);

      const authConfig = getAuthConfig();
      const apiResponse = await axios.get(`${baseUrl}/summoner/by-riot-id`, {
        ...authConfig,
        params: {
          region,
          gameName: encodeURIComponent(summonerNameValue),
          tagLine: encodeURIComponent(tagLine)
        },
      });

      if (apiResponse.status !== 200) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const newPlayerDetails = {
        summonerNameValue,
        tagLine,
        webSocketResponse: webSocketResponse || {},
        apiResponse: apiResponse.data[0], // First summoner fetched from API
      };

      store.commit("summoner/setPlayerDetails", newPlayerDetails);
      store.commit("summoner/setCurrentSummoner", newPlayerDetails);

    } else {
      const newPlayerDetails = {
        summonerNameValue,
        tagLine,
        webSocketResponse: webSocketResponse || existingSummoner.webSocketResponse,
        apiResponse: existingSummoner.apiResponse,
      };

      store.commit("summoner/setPlayerDetails", newPlayerDetails);
      store.commit("summoner/setCurrentSummoner", newPlayerDetails);
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
    console.log("Received summoner name response from WebSocket:", response);
    if (response && typeof response === 'object' && response.gameName && !response.error) {
      const newSummonerName = response.gameName;
      const tagLine = response.tagLine || "";

      // Fetch and save the summoner data
      await fetchAndSaveSummonerData(newSummonerName, tagLine, "europe", response);
    } else {
      console.error("Invalid or empty summoner response from WebSocket:", response);
    }

  });

  // Trigger the request to get the summoner name
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
