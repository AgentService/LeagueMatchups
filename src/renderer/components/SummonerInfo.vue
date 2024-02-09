<template>
  <div class="dropdown summoner-display" ref="dropdownContainer">
    <button
      class="btn btn-dark dropdown-toggle position-relative"
      type="button"
      @click="dropdownOpen = !dropdownOpen"
      :aria-expanded="dropdownOpen.toString()"
    >
      <div class="d-flex align-items-center">
        <div class="icon-container">
          <!-- Adjust src and alt as necessary based on the current selection -->
          <img
            :src="currentSelection ? getSummonerIcon(currentSelection.profileiconid) : defaultIcon"
            alt="Summoner Icon"
            class="rounded-circle icon-image"
          >
          <span
            class="level-pill"
          >{{ currentSelection ? currentSelection.summonerlevel : 'N/A' }}</span>
        </div>
        <span class="ps-2 text-light">{{ currentSelection.gamename || 'Select Summoner' }}</span>
        <span class="text-secondary">#{{ currentSelection.tagline || '' }}</span>
      </div>
    </button>
    <div class="dropdown-menu" :class="{ 'show': dropdownOpen }">
      <div class="dropdown-header">Account</div>
      <div
        v-for="detail in allPlayerDetails"
        :key="detail.puuid"
        class="dropdown-item position-relative"
        @click="selectSummoner(detail)"
      >
        <img
          :src="getSummonerIcon(detail.profileIconId)"
          alt="Summoner Icon"
          class="icon-menu-image"
        >
        <span class="ms-2">{{ detail.name }}</span>
      </div>
    </div>
  </div>
</template>


<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue';
import {useStore} from 'vuex';
import {getUrlHelper} from '../globalSetup'; // Adjust path as needed
const store=useStore();

const dropdownContainer=ref(null);
const dropdownOpen=ref(false);

const profileIconId=computed(() => store.getters['summoner/profileIconId']);
const currentSelection=ref({});

const allPlayerDetails=computed(() => store.getters['summoner/getAllPlayerDetails']);
// Somewhere in your Vue component

const getSummonerIcon=(iconId) => {
  const urlHelper=getUrlHelper();
  return urlHelper.getSummonerIconUrl(iconId);
};

function toggleDropdown() {
  dropdownOpen.value=!dropdownOpen.value;
}

function handleClickOutside(event) {
  if (dropdownContainer.value&&!dropdownContainer.value.contains(event.target)) {
    dropdownOpen.value=false;
  }
}
function selectSummoner(summonerDetail) {
  currentSelection.value=summonerDetail;
  dropdownOpen.value=false; // Close the dropdown after selection
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (!allPlayerDetails.value.length) {
    store.dispatch('summoner/fetchSummonerDataByAccountId').then(() => {
      // Default to the first entry after data is fetched
      if (allPlayerDetails.value.length) {
        currentSelection.value=allPlayerDetails.value[0];
      }
    });
  } else {
    // If player details are already loaded, default to the first entry
    currentSelection.value=allPlayerDetails.value[0];
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
  
<style scoped>
.summoner-display {
  border: none;
  margin: 1rem 0;
  align-items: center;
  cursor: pointer;
  display: inline-block;
  position: relative;
}

#dropdownSummonerButton {
  background: transparent;
  border: none;
  padding: 1rem;
  border-radius: 6px 6px 0px 0px;
}

#dropdownSummonerButton:hover {
  background: var(--grey-4);
  border-bottom: 0px;
  transition: background 0.2s ease-in-out;
}

#dropdownSummonerButton:focus {
  background: var(--grey-4);
  border-bottom: 0px;
  transition: background 0.2s ease-in-out;
}

.dropdown-menu.show {
  display: block;
}

.icon-container {
  position: relative;
}

.icon-image {
  width: 45px;
  height: 45px;
  border: 2px solid #c0c0c0;
}

.icon-menu-image {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #c0c0c0;
}

.level-pill {
  position: absolute;
  bottom: -5px;
  left: 5px;
  background-color: #000000;
  color: #d3d3d3;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: bold;
}

.dropdown-menu {
  background: var(--grey-4);
  color: #f8f9fa;
  border-radius: 0 0 6px 6px;
  border-top: none;
  width: 100%;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
}

/* Dropdown item styling */
.dropdown-item {
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.dropdown-item .flex-grow-1 {
  display: flex;
  flex-direction: column;
}

.dropdown-item,
.dropdown-header {
  font-size: 1rem;
  color: inherit;
}

.dropdown-header {
  font-size: 0.85rem;
  text-transform: uppercase;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background: rgba(45, 57, 65, 0.395);
  color: inherit;
}
</style>
  