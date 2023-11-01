<template>
  
<div class="champion-card">
  <div class="champion-selector">  
    <div class="search-popover-container">
        <input v-model="searchTerm" @input="filterChampions" @focus="isDropdownOpen = true" placeholder="Filter by champion..." class="search-input" />
        <div v-if="isDropdownOpen" class="champion-popover">
          <div v-for="champion in filteredChampions" :key="champion.id" class="champion-option" @click="selectChampion(champion)">
            <img :src="getChampionImageSource('small', champion.id)" alt="Champion Image" />
            <span>{{ champion.name }}</span>
          </div>
        </div>
      </div>
    <div class="champion-display">
      <img class="champion-image" :src="selectedChampion ? getChampionImageSource('loading', selectedChampion.id) : '/img/champions/placeholder.png'" alt="Champion Image"/>
    </div>
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
    getChampionImageSource(type, championId) {
    switch (type) {
      case 'small':
        return `/img/champions/${championId}.png`;
      case 'loading':
        return `/img/champion_loading/${championId}.png`;
      case 'splash':
        return `/img/champion_splash/${championId}.png`;
      default:
        // Handle the case where the type does not match 'small' or 'loading'
        return ''; // or some default path
    }
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
.champion-image {
  width: 100%; /* take up 100% of the container's width */
  height: 100%; /* take up 100% of the container's height */
  object-fit: cover; /* cover the container while maintaining aspect ratio */
  border-radius: 4px;
  border: 1px solid #2d3748;
}
.champion-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; /* or any specific value */
  width: 100%; /* or any specific value */
}
.champion-selector {
  position: relative;
   display: flex;
  flex-direction: column; /* Align children in a column direction */
  align-items: center; /* Center children horizontally */
}

.champion-display {
  position: relative;
  text-align: center;
}

.search-input {
  position: relative;
  width: 100%;
  border: none;
  border-radius: 4px;
}
.search-popover-container {
  display: flex;
  top:50;
  width: 100%; /* Take the full width of the parent */
  z-index: 1; /* Ensure it appears above other elements if there's overlap */
}


.champion-popover {
  width: 100%; /* Make the popover take up the full width of the parent */
  top: 40px; /* Position the popover 20px below the input */
  position: absolute;
  border-bottom: 1px solid #2d3748;
  transition: width 0.3s ease; /* Adding a transition for smooth expansion */
  background-color: #1a202c;
  border: 1px solid #2d3748;
  max-height: 200px;
  overflow-y: auto; /* Ensuring the popover is scrollable if content overflows */
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



</style>
