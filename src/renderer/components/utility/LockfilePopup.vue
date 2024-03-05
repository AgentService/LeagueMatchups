<template>
  <div class="custom-popup">
    <p>Please locate the directory containing the League of Legends lockfile. This is typically found in the game's
      installation directory.</p>
    <button @click="proceedToSelectDirectory">Locate Directory</button>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['close']);

const proceedToSelectDirectory = () => {
  emit('close');
  console.log('Proceeding to select directory');
  window.api.openPathDialog(); // Trigger the directory picker in the main process
};

window.api.receive("directory-path-selected", (data) => {
  const { leagueClientPath, directoryPath } = data;
  if (leagueClientPath) {
    // If leagueClientPath path is provided, use it for fetching summoner name
    window.api.send('get-summoner-name');
    router.push('/championMatchup');
  } else if (directoryPath) {
    // Use directoryPath for operations that don't need the lockfile
    // Example operation that needs just the directory path
  } else {
    console.error("No valid directory or lockfile found.");
    // Handle error
  }
});


</script>

<style>
.custom-popup {
  z-index: 100;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 300px;
}
</style>
