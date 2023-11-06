<template>

  <Navbar></Navbar>

  <div class="app-wrapper">
    <div class="app-container">
      <LearningObjectives></LearningObjectives>

      <div class="background-container gradient-top-border ">
        <!--
  <img v-if="championA" :src="`/img/champion_splash/${championA.id}.png`" class="background-image left mirrored-image" alt="Champion A" />
    <img v-if="championB" :src="`/img/champion_splash/${championB.id}.png`" class="background-image right" alt="Champion B" />
    -->

      </div>

      <div class="grid-container">

        <!-- Adjust the height to take up the remaining space after Navbar -->
        <!-- First Row -->
        <div class="row">
          <div class="col-md-3 d-flex container-md gradient-border">
          </div>
          <div class="col-md-6 d-flex align-items-stretch flex-column justify-content-between">
            <div class="row">
              <div class="d-flex justify-content-end w-50">
                <ChampionSearch :instanceId="1" @championSelected="setChampionA" />
              </div>
              <div class="d-flex justify-content-end w-50">
                <ChampionSearch class="gradient-border-laser" :instanceId="2" @championSelected="setChampionB" />
              </div>
            </div>
            <div class="row">
              <div class="d-flex justify-content-end w-50">
                <Template></Template>
              </div>
              <div class="d-flex justify-content-end w-50">
                <Template></Template>
              </div>
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-stretch gradient-border  ">
            <MatchupNotes></MatchupNotes>
          </div>
        </div>

        <!-- Second Row -->
        <div class="row">
          <div class="col-md-3 d-flex align-items-stretch gradient-top-border">
            <Template></Template>
          </div>

          <div class="col-md-6 d-flex flex-column align-items-stretch gradient-top-border">
            <div class="row">
              <div class="col-md-6 gradient-border">
              </div>
              <div class="col-md-6 gradient-border">
              </div>
            </div>


          </div>

          <div class="col-md-3 d-flex align-items-stretch gradient-border gradient-top-border">
            <Template></Template>
          </div>
        </div>

        <div class="row ">
          <div class="col-md-4 d-flex align-items-stretch gradient-top-border">
            <Template></Template>
          </div>

          <div class="col-md-4 d-flex align-items-stretch gradient-border gradient-top-border">
            <ChampionDataTest />
          </div>

          <div class="col-md-4 d-flex align-items-stretch gradient-border gradient-top-border">

          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>

import { ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import ChampionSearch from './components/ChampionSelection.vue';
import summonerWidget from './components/SummonerInfo.vue';
import MatchupNotes from './components/MatchupNotes.vue';
import LearningObjectives from './components/LearningObjectives.vue';
import Template from './components/Template.vue';

import Navbar from './components/TopNavbar.vue';

import { computed } from 'vue'
import ChampionDataTest from './components/test/ChampionDataTest.vue';

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


const store = useStore();
const baseUrl = import.meta.env.VITE_API_BASE_URL;

let bothSelected = false;

onMounted(async () => {
});
const handleMatchup = () => {

  if (championA.value && championB.value) {
    if (!bothSelected) {
      bothSelected = true;

      const champAName = championA.value.name;
      const champBName = championB.value.name;

      if (champAName === champBName) {
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
  championA.value = champion;
};

const setChampionB = (champion) => {
  championB.value = champion;
};

watch([championA, championB], (newValues, oldValues) => {
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






/* .app-wrapper is the main wrapper that contains all content including the navbar and banner */
.app-wrapper {
  flex: 1;
  /* Flex grow to fill available space */
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  /* Auto margins on left and right to center the block */
  width: 100%;
  max-width: 1280px;
}

/* .app-container is a flex container for the main content area below the navbar and banner */
.app-container {
  flex: 1;
  /* Flex grow to take up all available space */
  position: relative;
  justify-content: center;
  /* Centers children horizontally */
  align-items: center;
  /* Centers children vertically */
  flex-grow: 1;
  /* Fill the available space */
  /* Establishes a flex context for children */
  flex-direction: column;
  /* Stacks children vertically */
  border-top: 2px solid var(--blue-laser-gradient);
}

/* Gradient Top Border Class */
.gradient-top-border::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  /* Align it to the top of the element */
  height: 2px;
  /* Height of the border */
  background: var(--border-grey-gradient-horizontal);
}

/* .grid-container holds the main grid and should fill the available space in .app-container */
.grid-container {

  flex-grow: 1;
  /* Takes up all available space within .app-container */
  display: flex;
  /* Establish a flex context */
  flex-direction: column;
  /* Align children in a column */

}

/* Each .row should take up an equal amount of space within .grid-container */
.row {
  justify-content: center;
  /* Center columns horizontally */
  height: 350px;
  flex-grow: 1;
  /* Flex grow to fill the container */
  min-height: 0;
  /* Override the default min-height to ensure flex-grow works */
  --bs-gutter-x: 0;

}


.custom-component {
  height: 100%;
}

.mirrored-image {
  transform: scaleX(-1);
  /* Flip the image horizontally */
}

/* Background 
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
  background: var(--background-1-gradient);

}*/
.background-container {
  position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 999;
    background: linear-gradient( to right, hsla(var(--primary-hsl-hover) / 0.75), hsla(var(--primary-hsl) / 1) );
    opacity: 0;
    animation: none;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.row.front {
  z-index: 0;
}

@media (max-height: 780px) {
  .row {
    min-height: 0;
  }

  .app-wrapper {
    width: 100%;
    /* Full width on smaller screens */
    margin: 10px 0;
    /* Adjusted margin for smaller screens */
  }

  /* Adjust the app-container padding for smaller screens if needed */
  .app-wrapper {
    padding: 0 10px;
  }
}

.front {
  z-index: 0;
}


.background-image {
  position: absolute;
  bottom: 25%;
  /* Center the image vertically */
  left: 50%;
  /* Center the image horizontally */
  max-width: 100%;
  /* Increase the width to have a "zoomed out" effect */
  max-height: 100%;
  /* Increase the height to have a "zoomed out" effect */
  z-index: -2;
  background-size: contain;
  background-position: center;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: -10px;
  width: 100%;
  height: 100%;
  z-index: -2;
  /* Place it above the images but below other content */
}

.gradient-overlay2x {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #010c2260;
  z-index: -2;
  /* Place it above the images but below other content */
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
  width: 1px;
  /* Width of the border */
  background: var(--border-grey-gradient);
  top: 20%;
  /* Center the border vertically */
}

.gradient-border-laser::before {
  position: relative;
}

.gradient-border-laser::before {
  content: "";
  position: absolute;
  left: 0;
  height: 60%;
  width: 1px;
  /* Width of the border */
  background: linear-gradient(to top, #000406, var(--gold-3), var(--gold-3), #000406);
  /* Your gradient here */
  top: 20%;
  /* Center the border vertically */
}


/* Ensure the columns are positioned relatively to position the gradient border correctly */
.col-md-3,
.col-md-4,
.col-md-6 {
  position: relative;
  height: 100%;
  /* Full height of the row */
  padding: 0;
  /* Set to 0 or any specific value you need */
  margin: auto;
  /* Auto margins on left and right to center the block */
}
</style>