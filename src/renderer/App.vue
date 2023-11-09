<template>
  <Navbar>

  </Navbar>
  <div class="app-wrapper">
    <div class="app-container">
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
            <LearningObjectives></LearningObjectives>

          </div>
          <div class="col-md-6">
            <!-- New slim full-width row above ChampionSearch components -->
            <div class="row slim-row ">
              <div class="col-12">
                <div class="title-bar">
                  <h4>Select your Matchup</h4>
                </div>
              </div>
            </div>
            <!-- Existing rows for ChampionSearch components -->
            <div class="row">
              <div class="col-md-6 d-flex">
                <ChampionSearch :instanceId="1" @championSelected="setChampionA" />
              </div>
              <div class="col-md-6 d-flex">
                <ChampionSearch class="gradient-border-laser" :instanceId="2" @championSelected="setChampionB" />
              </div>
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-stretch gradient-border">
          </div>
        </div>
        <!-- Second Row -->
        <div class="row">
          <div class="col-md-3 d-flex align-items-stretch gradient-top-border">
          </div>
          <div class="col-md-6 d-flex flex-column align-items-stretch ">
            <div class="row">
              <div class="col-md-6 gradient-border">
                <ChampionStats :champion="championA" />
              </div>
              <div class="col-md-6 gradient-border">
                <ChampionStats :champion="championB" />
              </div>
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-stretch gradient-border gradient-top-border">
          </div>
        </div>
        <div class="row ">
          <div class="col-md-4 d-flex align-items-stretch gradient-top-border">
          </div>
          <div class="col-md-4 d-flex align-items-stretch gradient-border gradient-top-border">
            <MatchupNotes></MatchupNotes>

          </div>
          <div class="col-md-4 d-flex align-items-stretch gradient-border gradient-top-border">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>

import { ref, watch, onMounted } from "vue";
import { useStore } from "vuex";

// Debug
import Debug from "debug";

import ChampionSearch from "./components/ChampionSelection.vue";
import ChampionStats from "./components/ChampionStats.vue";

import MatchupNotes from "./components/MatchupNotes.vue";
import LearningObjectives from "./components/LearningObjectives.vue";
import Template from "./components/Template.vue";
import Navbar from "./components/TopNavbar.vue";
import ChampionDataTest from "./components/test/ChampionDataTest.vue";

const debug = Debug("app:component:App");

const championA = ref(null);
const championB = ref(null);

// const backgroundStyle2 = computed(() => {
// 	const champAImage = championA.value ? `/img/champion_loading/${championA.value.id}.png` : "";
// 	const champBImage = championB.value ? `/img/champion_loading/${championB.value.id}.png` : "";

// 	return {
// 		backgroundImage: `linear-gradient(to right, url(${champAImage}) left, url(${champBImage}) right)`,
// 		backgroundSize: "50% 100%, 50% 100%",
// 		backgroundRepeat: "no-repeat, no-repeat"
// 	};
// });

const store = useStore();
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
      debug(`handleMatchup: ${JSON.stringify(matchupKey)}`);
      store.dispatch("matchups/handleMatchupCreation", matchup);
    }
  } else {
    bothSelected = false;
  }
};


const setChampionA = (champion) => {
  championA.value = champion;
  store.dispatch("matchups/setChampionA", champion);
};

const setChampionB = (champion) => {
  championB.value = champion;
  store.dispatch("matchups/setChampionB", champion);
};

watch([championA, championB], (/* newValues, oldValues */) => {
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


.title-bar {
	display: flex;
	justify-content: center;
	align-items: center;
	color: var(--gold-3);
	border-bottom: 1px solid var(--gold-4);
	margin-bottom: 1rem;
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
  max-width: 1600px;
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
  /* flex-grow: 1; */
  /* Flex grow to fill the container */
  min-height: 0;
  /* Override the default min-height to ensure flex-grow works */
  --bs-gutter-x: 0;

}

/* For slim rows */
.slim-row {
  justify-content: center;
  height: auto;
  /* Let the content define the height */
  flex-grow: 0;
  /* Do not allow the row to grow */
  padding: 0 2rem;
}


.background-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 999;
  background: var(--navbar-background-gradient);
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