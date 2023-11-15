<template>
  <Navbar>

  </Navbar>
  <Login></Login>
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
        <!-- Existing rows for ChampionSearch components -->
        <div class="row slim-row">
          <div class="col-md-3 h-100 ">
          </div>
          <div class="col-md-9">
            <div class="row ">
              <div class="col-md-6 d-flex flex-column h-100   gradient-border ">
                <div class="title-bar">
                  <h4 v-show="!bothChampionsSelected">Select your Champion</h4>
                </div>
              </div>
              <!-- <div class="gold-border">
              </div> -->
              <div class="col-md-3 d-flex flex-column h-100  gradient-border ">
                <div class="title-bar">
                  <h4 v-show="!bothChampionsSelected">Select your Matchup</h4>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="col-md-3 h-100">
            <ChampionTips :champion="championB" :instanceId="2" />
          </div> -->
        </div>
        <div class="row">
          <div class="col-md-3 h-100 ">
            <ChampionTips :champion="championA" :instanceId="1" />
          </div>
          <div class="col-md-9">
            <div class="row ">
              <div class="col-md-6 d-flex flex-column h-100   gradient-border ">
                <ChampionSearch :instanceId="1" @championSelected="setChampionA" />
              </div>
              <!-- <div class="gold-border">
              </div> -->
              <div class="col-md-3 d-flex flex-column h-100  gradient-border ">
                <ChampionSearch :instanceId="2" @championSelected="setChampionB" />
              </div>
            </div>
          </div>
          <!-- <div class="col-md-3 h-100">
            <ChampionTips :champion="championB" :instanceId="2" />
          </div> -->
        </div>
        <!-- Second Row -->
        <div class="row">
          <div class="col-md-3 d-flex align-items-stretch gradient-top-border">
            <LearningObjectives></LearningObjectives>

          </div>
          <div class="col-md-6 d-flex flex-column align-items-stretch ">
            <div class="row">
              <div class="col-md-6 gradient-border h-100">
                <!-- <ChampionStats :champion="championA" :instanceId="1" /> -->
              </div>
              <div class="col-md-6 gradient-border h-100">
                <!-- <ChampionStats :champion="championB" :instanceId="2" /> -->
                <ChampionNotes></ChampionNotes>

              </div>
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-stretch gradient-border ">
            <!-- <ChampionTips :champion="championB" :instanceId="2" /> -->

          </div>
        </div>
        <div class="row ">
          <div class="col-md-3 gradient-border ">
          </div>
          <div class="col-md-6">
            <div class="row">
              <div class="col-md-2 gradient-border ">
                <MatchupRating> </MatchupRating>
              </div>
              <div class="col-md-8  gradient-top-border ">
                <MatchupNotes></MatchupNotes>
              </div>
              <div class="col-md-2  gradient-border ">
                <MatchupRating> </MatchupRating>
              </div>
            </div>
          </div>
          <div class="col-md-3">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>

import { ref, watch, onMounted, computed } from "vue";
import { useStore } from "vuex";

// Debug
import Debug from "debug";

import Login from "./components/Login.vue";

import ChampionSearch from "./components/ChampionSelection.vue";
import ChampionStats from "./components/ChampionStats.vue";
import ChampionTips from "./components/ChampionTips.vue";
import ChampionNotes from "./components/ChampionNotes.vue";

import MatchupNotes from "./components/MatchupNotes.vue";
import MatchupRating from "./components/MatchupRating.vue";

import LearningObjectives from "./components/LearningObjectives.vue";
import Template from "./components/Template.vue";
import Navbar from "./components/TopNavbar.vue";
import ChampionDataTest from "./components/test/ChampionDataTest.vue";

const debug = Debug("app:component:App");

const championA = ref(null);
const championB = ref(null);

const bothChampionsSelected = computed(() => {
  return championA.value && championB.value;
});

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
  store.dispatch("champions/fetchChampionTips", champion);
};

const setChampionB = (champion) => {
  championB.value = champion;
  store.dispatch("matchups/setChampionB", champion);
  store.dispatch("champions/fetchChampionTips", champion);
};

watch([championA, championB], (/* newValues, oldValues */) => {
  bothSelected = false;
  handleMatchup();
});


</script>

<style scoped>
.gold-border {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  /* Style your indicator as needed */
  display: flex;
  background: linear-gradient(to bottom, #000406, var(--gold-3), var(--gold-3), #000406);
  max-width: 2px;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  /* Size, color, etc. */
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
  --navbar-height: 50px;
  --banner-height: 500px;
  --row-gutter: 0px;
}

* {
  box-sizing: border-box;
}

.title-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--gold-3);

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
  display: flex;
  /* border: 1px solid red; */
  justify-content: center;
  /* Center columns horizontally */
  height: 350px;
  /* Add space between rows */
  --bs-gutter-x: 0;

}

/* For slim rows */
.slim-row {
  justify-content: center;
  height: 30px;
  /* Let the content define the height */
  /* Do not allow the row to grow */
}


.background-container {
  position: static;
  /* or 'relative' based on your needs */
  height: auto;
  /* Adjust based on content or set to a specific height */
  opacity: 1;
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

/* Set the parent elements to position relative for the pseudo-elements to position correctly */
.col-md-3,
.col-md-6,
.col-md-4,
.row,
.background-container {
  position: relative;
  /* This is important for the absolute positioning of pseudo-elements */
  /* ... other styles ... */
}

/* Gradient Top Border Class */
.gradient-top-border::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  /* Height of the border */
  background: var(--border-grey-gradient-horizontal);
  z-index: 2;
  /* Ensure it's above the content but below any floating elements */
}

/* Gradient Border Class for left border */
.gradient-border::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
  /* Width of the border */
  background: var(--border-grey-gradient);
  z-index: 2;
}

/* Gradient Border Class for right border */
.gradient-border::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 1px;
  /* Width of the border */
  background: var(--border-grey-gradient);
  z-index: 2;
}

/* Gradient Border Laser Class for vertical border */
.gradient-border-laser::after {
  content: "";
  position: absolute;
  top: 20%;
  /* Adjust as necessary */
  bottom: 20%;
  /* Adjust as necessary */
  left: 0;
  width: 1px;
  /* Width of the border */
  background: linear-gradient(to top, #000406, var(--gold-3), var(--gold-3), #000406);
  z-index: 0;
}

/* Apply left border only to the first column and right border only to the last column within each row */
.row {
  display: flex;
}

.gradient-border:not(:last-child)::after {
  display: none;
  /* This hides the right border for all but the last child */
}

.gradient-border:not(:first-child)::before {
  display: none;
  /* This hides the left border for all but the first child */
}

/* Set the columns to grow and fill the available space */
.col-md-3,
.col-md-6 {
  position: relative;
  /* Adjust based on content */
  flex-grow: 1;
  /* Allow columns to grow */
  /* Provide some spacing inside the columns */
}
</style>