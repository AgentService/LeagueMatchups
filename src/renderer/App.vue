<template>
  <div class="app-container">
    <header class="app-header">
      <Navbar />
    </header>
    <main class="app-main">
      <section class="champion-selectors">
        <ChampionSearch :instanceId="1" @championSelected="setChampionA"/>
        <ChampionSearch :instanceId="2" @championSelected="setChampionB"/>
        <ChampionMatchup :currentMatchup="currentMatchup" />
      </section>
      <section>
        <MatchupNotes />
      </section>
    </main>
    <footer class="app-footer">
      <p>© 2022 League of Legends Learning App</p>
    </footer>
  </div>
</template>


<script setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import ChampionSearch from './components/matchup/ChampionSearch.vue';
import ChampionMatchup from './components/matchup/ChampionMatchup.vue';
import MatchupNotes from './components/matchup/MatchupNotes.vue';

import Navbar from './components/Navbar.vue';

const store = useStore();
const championA = ref(null);
const championB = ref(null);


let bothSelected = false;
const uniqueMatchups = new Set();

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

      if (!uniqueMatchups.has(matchupKey)) {
        uniqueMatchups.add(matchupKey);
        const matchup = {
          id: matchupKey, // using matchupKey as a unique id
          champions: [championA.value, championB.value] // retaining champions data
        };
        store.dispatch('createMatchup', matchup);
        store.dispatch('fetchSelectedMatchup', matchup.id);
        console.log(`Matchup created or updated successfully with champions: ${champAName}, ${champBName}`);
      } else {
        console.log(`Matchup between ${champAName} and ${champBName} already exists.`);
      }
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
}

.app-container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: 100%;
  box-sizing: border-box;
  height: 100%;  /* 100% of the viewport height */
  overflow: hidden;  /* Hide overflow content */
  padding: 1rem;
  background-color: var(--primary-color);
  color: var(--text-color);
  font-family: var(--font-family);
}

.app-header, .app-footer {
  text-align: center;
  background-color: rgb(45, 141, 148);
}

.app-main {
  display: grid;
  grid-gap: 2rem;
  flex: 1;  /* If parent is a flex container */
  width: 100%;
  overflow: auto;
}

.champion-selectors {
  display: flex;
  justify-content: space-between; /* or space-evenly, depending on what you like */
  overflow: hidden;
  background-color: var(--secondary-color);
  padding: 5rem;

}



button, input {
  transition: background-color var(--transition-duration) ease;
}

button:hover, input:hover {
  background-color: var(--accent-color);
}

.your-champion {
  background-color: var(--your-champion-color);
}
.opponent-champion {
  background-color: var(--opponent-champion-color);
}
</style>