<template>
  <button @click="handleButtonClick()">Get Summoner Data</button>
  <div v-if="summonerData">
    {{ summonerData }}
  </div></template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { retrieveFromSessionStorage } from '../../store/storage.mjs';

const store = useStore();
const playerDetails = computed(() => store.state.playerDetails);

function handleButtonClick() {
  // When the button is clicked, call the function with the value of the computed property
  fetchAndSaveSummonerData(playerDetails.value.gameName);
}

// Make sure to pass only the value, not the entire ref
const fetchAndSaveSummonerData = async (summonerNameValue) => {
  try {
    // Now summonerNameValue should be a string, not a ComputedRefImpl object
    if (summonerNameValue) {
      console.log('Fetching summoner data for:', summonerNameValue);
      await store.dispatch('summoner/fetchSummonerData', { region: "europe", gameName: summonerNameValue, tagLine: "EUW1" });
    }
  } catch (error) {
    console.error('Error fetching and saving summoner data:', error);
  }
};

onMounted(() => {
  window.api.receive('summoner-name-response', (newSummonerName) => {
    const currentSummonerData = retrieveFromSessionStorage('summonerData');
    if (!currentSummonerData || currentSummonerData.name !== newSummonerName) {
      // New summoner name detected or not found in sessionStorage, fetch new data
      fetchAndSaveSummonerData(newSummonerName);
    } else {
      // Summoner name matches what's in sessionStorage, do nothing or refresh
      console.log('Summoner data is up to date.');
    }
  });

  // Always send a request to the main process to get the current summoner name
  window.api.send('get-summoner-name');
});

</script>
