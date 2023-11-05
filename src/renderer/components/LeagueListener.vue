<template>
  <button @click="fetchAndSaveSummonerData">Get Summoner Data</button>
  <div v-if="summonerData">
    {{ summonerData }}
  </div></template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { retrieveFromSessionStorage } from '../../store/storage.mjs';

const store = useStore();

const RIOT_API_KEY = import.meta.env.VITE_RIOT_API_KEY;
const summonerName = ref(''); // Assuming you have a way to set this

const summonerData = computed(() => {
  // Here is where you put your console.log for the computed property.
  const data = store.state.summoner.summonerData;
  console.log('Summoner data in component:', data);
  return data;
});

const fetchAndSaveSummonerData = async () => {
  try {
    // Assuming the summonerName is retrieved and stored in a ref named 'summonerName'
    if (summonerName.value) {
      await store.dispatch('summoner/fetchSummonerData', summonerName.value);
    }
  } catch (error) {
    console.error('Error fetching and saving summoner data:', error);
  }
};


// Register the receive listener when the component is mounted
onMounted(() => {
  window.api.receive('summoner-name-response', (newSummonerName) => {
    const currentSummonerData = retrieveFromSessionStorage('summonerData');

    if (!currentSummonerData || currentSummonerData.summonerName !== newSummonerName) {
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
