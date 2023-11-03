<template>
    <div class="app-wrapper">


  <LearningObjectives></LearningObjectives>

  <div class="app-container">
  <div class="background-container gradient-top-border">
    <!--
  <img v-if="championA" :src="`/img/champion_splash/${championA.id}.png`" class="background-image left mirrored-image" alt="Champion A" />
    <img v-if="championB" :src="`/img/champion_splash/${championB.id}.png`" class="background-image right" alt="Champion B" />
    -->

  </div>

  <div class="grid-container">

    <!-- Adjust the height to take up the remaining space after Navbar -->
    <!-- First Row -->
    <div class="row">
      <div class="col-md-3 d-flex align-items-stretch  gradient-border">
        <MatchupNotes></MatchupNotes>

        </div>
      <div class="col-md-6 d-flex align-items-stretch  gradient-border">
        <ChampionSearch :instanceId="1" @championSelected="setChampionA" />
        <ChampionSearch :instanceId="2" @championSelected="setChampionB" />
      </div>

      <div class="col-md-3 d-flex align-items-stretch gradient-border">
        <Template></Template>

      </div>
    </div>

    <!-- Second Row -->
    <div class="row">
      <div class="col-md-3 d-flex align-items-stretch ">
        <Template></Template>
      </div>

      <div class="col-md-6 d-flex flex-column align-items-stretch">
        <div class="row">
          <div class="col-md-6 gradient-border">
        </div>
        <div class="col-md-6 gradient-border">
        </div>
        </div>
      
        
      </div>

      <div class="col-md-3 d-flex align-items-stretch gradient-border">
        <Template></Template>
      </div>
    </div>

     <div class="row ">
      <div class="col-md-4 d-flex align-items-stretch ">
        <Template></Template>
      </div>

      <div class="col-md-4 d-flex align-items-stretch gradient-border">
        <Template></Template>
      </div>

      <div class="col-md-4 d-flex align-items-stretch gradient-border">
        <Template></Template>

      </div>
    </div>
  </div>
  </div>
    </div>
</template>



<script setup>
 
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import ChampionSearch from './components/matchup/ChampionSearch.vue';
import ChampionMatchup from './components/matchup/ChampionMatchup.vue';
import MatchupNotes from './components/matchup/MatchupNotes.vue';
import LearningObjectives from './components/learningObjectives/LearningObjectives.vue';
import Template from './components/matchup/Template.vue';

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
  --navbar-height: 50px; 
  --banner-height: 500px; 
  --row-gutter: 0px;
}




/* #app is the root Vue element and should fill the entire height of the viewport */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Full viewport height */

}

/* .app-wrapper is the main wrapper that contains all content including the navbar and banner */
.app-wrapper {
  flex: 1; /* Flex grow to fill available space */
  display: flex;
  flex-direction: column;

}

/* .app-container is a flex container for the main content area below the navbar and banner */
.app-container {
  flex: 1; /* Flex grow to take up all available space */
  position: relative;
  display: flex; /* Establishes a flex context for children */
  flex-direction: column; /* Stacks children vertically */
  border-top: 2px solid var( --blue-laser-gradient);
}

/* Gradient Top Border Class */
.gradient-top-border::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0; /* Align it to the top of the element */
  height: 2px; /* Height of the border */
  background: var(--border-grey-gradient-horizontal);
}

/* .grid-container holds the main grid and should fill the available space in .app-container */
.grid-container {
  flex-grow: 1; /* Takes up all available space within .app-container */
  display: flex; /* Establish a flex context */
  flex-direction: column; /* Align children in a column */

}

/* Each .row should take up an equal amount of space within .grid-container */
.row {
  flex-grow: 1; /* Flex grow to fill the container */
  min-height: 0; /* Override the default min-height to ensure flex-grow works */
  --bs-gutter-x: 0;

}


.custom-component { 
  height: 100%; 
}
.mirrored-image {
  transform: scaleX(-1); /* Flip the image horizontally */
}
/* Background */
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
  background: var(--background-1-gradient);

}
.row.front {
  z-index: 0;
}

@media (max-height: 780px) {
  .row {
    min-height: 0;

  }
}
.front {
  z-index: 0;
}


.background-image {
  position: absolute;
  bottom: 25%; /* Center the image vertically */
  left: 50%; /* Center the image horizontally */
  max-width: 100%; /* Increase the width to have a "zoomed out" effect */
  max-height: 100%; /* Increase the height to have a "zoomed out" effect */
  z-index: -2;
  background-size:contain;
  background-position: center;
}
.gradient-overlay {
  position: absolute;
  top: 0;
  left: -10px;
  width: 100%;
  height: 100%;
  z-index: -2; /* Place it above the images but below other content */
}

.gradient-overlay2x {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #010c2260;
  z-index: -2; /* Place it above the images but below other content */
}


.left {
  left: 0;
 /* clip-path: polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%); /* Display the left half */
}
.right {
  right: 0;
/*  clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%); /* Only display the right half of the image */
}
/* Gradient Border Class */
.gradient-border::before {
  content: "";
  position: absolute;
  left: 0;
  height: 60%;
  width: 4px; /* Width of the border */
  background: var(--border-grey-gradient);
  top: 20%; /* Center the border vertically */
}

/* Ensure the columns are positioned relatively to position the gradient border correctly */
.col-md-3,
.col-md-4,
.col-md-6 {
  position: relative;
}

</style>