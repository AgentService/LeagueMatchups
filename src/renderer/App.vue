<template>
  <Navbar/>

  <div class="app-container position-relative">
  <div class="background-container">
  <img v-if="championA" :src="`/img/champion_splash/${championA.id}.png`" class="background-image left mirrored-image" alt="Champion A" />
    <img v-if="championB" :src="`/img/champion_splash/${championB.id}.png`" class="background-image right" alt="Champion B" />
    <div class="gradient-overlay"></div>
    <div class="gradient-overlay2"></div>

  </div>


    <!-- Adjust the height to take up the remaining space after Navbar -->
    <!-- First Row -->
    <div class="row h-50">
      <div class="col-md-4 d-flex align-items-center justify-content-center">
      </div>

      <div class="col-md-4 d-flex align-items-center justify-content-center front">
        <ChampionSearch :instanceId="1" @championSelected="setChampionA" />
        <ChampionSearch :instanceId="2" @championSelected="setChampionB" />
      </div>

      <div class="col-md-4 d-flex align-items-center justify-content-center">
      </div>
    </div>

    <!-- Second Row -->
    <div class="row h-50">
      <div class="col-md-4 d-flex align-items-center justify-content-center">
        
      </div>

      <div class="col-md-4 d-flex align-items-center justify-content-center">
        <MatchupNotes></MatchupNotes>

      </div>

      <div class="col-md-4 d-flex align-items-center justify-content-center">
      </div>
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

const championA = ref(null);
const championB = ref(null);
debugger
const backgroundStyle2 = computed(() => {
  const champAImage = championA.value ? `/img/champion_loading/${championA.value.id}.png` : '';
  const champBImage = championB.value ? `/img/champion_loading/${championB.value.id}.png` : '';
  
  return {
    backgroundImage: `linear-gradient(to right, url(${champAImage}) left, url(${champBImage}) right)`,
    backgroundSize: '50% 100%, 50% 100%',
    backgroundRepeat: 'no-repeat, no-repeat'
  };
  });

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
.mirrored-image {
  transform: scaleX(-1); /* Flip the image horizontally */
}
.background-container {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: black; /* Your background color */


}
.front {
  z-index: 1;
}
.app-container {
  position: relative;
  height: 100vh; /* Adjust height as needed */
  background: 
    radial-gradient(circle at center, transparent 10%, rgba(0, 0, 0, 0.6) 100%), 
    url('/img/your_background_image.jpg') no-repeat center center/cover, 
    rgba(0, 0, 0, 0.589)
}
.background-image {
  position: absolute;
  top: 25%; /* Center the image vertically */
  left: 50%; /* Center the image horizontally */
  max-width: 100%; /* Increase the width to have a "zoomed out" effect */
  max-height: 100%; /* Increase the height to have a "zoomed out" effect */
  z-index: -1;
  background-size: cover;
  background-position: center;
  mask-image: radial-gradient(ellipse at center, transparent 50%, black 50%, black 100%);
}
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0), rgba(0,0,0,1), rgba(255,255,255,0));
  z-index: -1; /* Place it above the images but below other content */
}

.left {
  left: 0;
 /* clip-path: polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%); /* Display the left half */

}

.right {
  right: 0;
/*  clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%); /* Only display the right half of the image */
}
.app-container {
  
  height: calc(100vh - 32px); /* Subtracting the navbar height */
}
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
  --navbar-height: 56px; /* Set this to the actual height of your Navbar */
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
body {
  background-color: black; /* or any color you prefer */
}
</style>