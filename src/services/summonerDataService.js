// summonerDataService.js
import store from '../store/index'; // Import the store directly
import Debug from 'debug';
const debug = Debug('app:services:summoner-data');
// Function that invokes the fetching of summoner data
export async function fetchAndSaveSummonerData(summonerNameValue) {
  try {
    if (summonerNameValue) {
      debug('Fetching summoner data for:', summonerNameValue);
      await store.dispatch('summoner/fetchSummonerData', {
        region: "europe",
        gameName: summonerNameValue,
        tagLine: 'euw1',
      });
    }
  } catch (error) {
    console.error('Error fetching and saving summoner data:', error);
  }
}

// Function to initialize summoner data fetching
export function initializeSummonerDataFetching() {
  window.api.receive('summoner-name-response', async (newSummonerName) => {
    const currentSummonerData = JSON.parse(localStorage.getItem('summonerData')); // Adjust if you're using sessionStorage
    if (!currentSummonerData || currentSummonerData.name !== newSummonerName) {
      await fetchAndSaveSummonerData(newSummonerName);
    } else {
      debug('Summoner data already up to date');
    }
  });

  window.api.send('get-summoner-name');
}
