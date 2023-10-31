// champion search component
<template>
  <div class="champion-selector">    
     <div class="champion-display">
      <div class="search-popover-container">
    <input v-model="searchTerm" @input="filterChampions" @focus="isDropdownOpen = true" placeholder="Filter by champion..." class="search-input" />
    <div v-if="isDropdownOpen" class="champion-popover">
      <div v-for="champion in filteredChampions" :key="champion.id" class="champion-option" @click="selectChampion(champion)">
        <img :src="getChampionImageSource(champion.id)" alt="Champion Image" />
        <span>{{ champion.name }}</span>
      </div>
    </div>
  </div>
      <img :src="selectedChampion ? getChampionImageSource(selectedChampion.id) : '/img/champions/placeholder.png'" alt="Champion Image" />
    </div>

    
    <div class="selected-champion">
  </div>
  </div>
</template>


<script>
import axios from 'axios';
import { useStore } from 'vuex';

export default {
  props: {
    instanceId: {
      type: Number,
      required: true
    }
  },
  data() {
  
    return {
      searchTerm: '',
      champions: [],
      filteredChampions: [],
      selectedChampion: null,
      selectedChampions: [], // Initialize empty array
      isDropdownOpen: false // A mystical gatekeeper that controls the visibility of the dropdown

    };
  },
  mounted() {
    
    const store = useStore();
    store.dispatch('fetchMatchups'); // Fetch matchups when the component mounts
    axios.get('http://localhost:3001/api/champions')
    .then(response => {
      // Convert object to array
      this.champions = Object.values(response.data);

      // Filter out Aatrox
      const filteredChampions = [...this.champions];
      // Set a default champion (let's say the second one in the filtered list)
    // Preselect a champion based on instanceId or other conditions
      const preselectedChampion = this.instanceId === 1 ? this.champions[1] : this.champions[2];
      this.selectChampion(preselectedChampion);
     
      this.filteredChampions = [...filteredChampions]; // Initially, all champions are displayed
    })
    .catch(error => {
      console.error('Error fetching champions:', error);
    });
  },
  
   
  methods: {
     filterChampions() {
    this.filteredChampions = this.champions.filter(champion => 
      champion.name.toLowerCase().startsWith(this.searchTerm.toLowerCase())
    );
    },
    selectChampion(champion) {
     // console.log("selectChampion method called with:", champion);

      this.selectedChampion = champion;
      this.searchTerm = ''; // Clears the search field, bestowing it with a fresh start
      this.$emit('championSelected', champion);

      this.closeDropdown();

    },
    getChampionImageSource(championId) {
      return `/img/champions/${championId}.png`;
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen; // The toggle spell that opens or closes the dropdown
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
  },
  computed: {
    matchups() {
      const store = useStore();
      return store.state.matchups; // Access matchups from the Vuex state
    },
  },
};
</script>

<style scoped>
.search-popover-container {
  position: absolute; /* Positioning the container */
  top: 0; /* Aligning it at the top */
  left: 0; /* Aligning it to the left */
}
.search-input {
  width: 200px; /* Expanding the search field when focused */
  border-bottom: 1px solid #2d3748;
  transition: width 0.3s ease; /* Adding a transition for smooth expansion */
  flex-direction: column;
  background-color: #1a202c;
  border: 1px solid #2d3748;
}

.champion-popover {
  width: 200px; /* Expanding the search field when focused */
  border-bottom: 1px solid #2d3748;
  transition: width 0.3s ease; /* Adding a transition for smooth expansion */
  flex-direction: column;
  background-color: #1a202c;
  border: 1px solid #2d3748;
  max-height: 200px;
  overflow-y: auto; /* Ensuring the popover is scrollable if content overflows */
}
.champion-display {
  display: flex;
  position: relative; /* Establishing a positioning context for the child elements */

  flex-direction: column;
  align-items: center;
}

.champion-option {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
}

.champion-option img {
  width: 30px;
  height: auto;
  margin-right: 0.5rem;
}
.champion-selector {

  width: 45%;
}

.selected-champion {
  flex: 1; /* Make it take up all available space */
  display: flex;
  /* ... */
}

</style>
