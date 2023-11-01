<template>
  <div :style="gridStyle" class="h-auto grid grid-rows-2 grid-cols-12 gap-4 p-4">
    <!-- First Row -->
    <div class="col-span-3 bg-gray-700 flex items-stretch overflow-auto">
      <MatchupNotes />
    </div>
    <!-- This column will be twice as wide as the others -->
    <div class="col-span-6 bg-gray-700 flex items-stretch overflow-auto">
      <ChampionSearch :instanceId="1" @championSelected="setChampionA" />
      <ChampionSearch :instanceId="2" @championSelected="setChampionB" />
    </div>
    <div class="col-span-3 bg-gray-700 flex items-stretch overflow-auto">
      <MatchupNotes />
    </div>
    
    <!-- Second Row -->
    <div class="col-span-3 bg-gray-700 flex items-stretch overflow-auto">
      <MatchupNotes />
    </div>
    <div class="col-span-6 bg-gray-700 flex items-stretch overflow-auto">
      <ChampionMatchup />
    </div>
    <div class="col-span-3 bg-gray-700 flex items-stretch overflow-auto">
      <MatchupNotes />
    </div>
  </div>
</template>



<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

   
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import ChampionSearch from './components/matchup/ChampionSearch.vue';
import ChampionMatchup from './components/matchup/ChampionMatchup.vue';
import MatchupNotes from './components/matchup/MatchupNotes.vue';

import Navbar from './components/Navbar.vue';

import { computed } from 'vue'

// Define your computed property using the Composition API
const gridStyle = computed(() => ({
  display: 'grid', // Ensures the grid display is set
  gap: '1rem', // Replace this with your preferred gap size
  width: '100%', // Full width
  height: '100vh', // Full viewport height
  padding: '1rem', // Replace with your preferred padding
  boxSizing: 'border-box', // Include padding in the width and height calculations
}))

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false },
  { name: 'Reports', href: '#', current: false },
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]
const store = useStore();
const championA = ref(null);
const championB = ref(null);
const baseUrl = import.meta.env.VITE_API_BASE_URL;
console.log('baseUrl:', baseUrl);

let bothSelected = false;

const handleMatchup = () => {
  console.log("handleMatchup called");

  if (championA.value && championB.value) {
    if (!bothSelected) {
      bothSelected = true;

      const champAName = championA.value.name;
      const champBName = championB.value.name;

      if (champAName === champBName) {
        console.error('You cannot select the same champion twice!');
        return;
      }
      const matchupKey = `${champAName}-${champBName}`;

      const matchup = {
        id: matchupKey, // using matchupKey as a unique id
        champions: [championA.value, championB.value] // retaining champions data
      };
      store.dispatch('handleMatchupCreation', matchup);
    }
  } else {
    bothSelected = false;
  }
};


const setChampionA = (champion) => {
  console.log("setChampionA called with:", champion);
  championA.value = champion;
};

const setChampionB = (champion) => {
  console.log("setChampionB called with:", champion);

  championB.value = champion;
};

watch([championA, championB], (newValues, oldValues) => {
  console.log('New Values:', newValues);
  console.log('Old Values:', oldValues);
  bothSelected = false;
  handleMatchup();
});

</script>



<style scoped>
html {
  box-sizing: border-box;
}
*, *::before, *::after {
  box-sizing: inherit;
}
/* Apply specific styles to sections as needed */
.section-container {
  background-color: #ccc; /* Example background color */
  padding: 16px; /* Example padding */
  overflow: auto; /* Enable scrolling if needed */
  /* Add any other necessary styling here */
}
:root {
  --primary-color: #1a202c;
  --secondary-color: #2d3748;
  --your-champion-color: #00aaff;
  --opponent-champion-color: #ff4500;
  --accent-color: #f56565;
  --navbar-color: #333;
  --text-color: #ffffff;
  --font-family: 'Roboto', sans-serif;
  --transition-duration: 0.3s;
}

</style>