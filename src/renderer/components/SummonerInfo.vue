<template>
	<div class="dropdown summoner-display" ref="dropdownContainer">
		<button class="btn btn-dark dropdown-toggle position-relative btn-fixed-width" type="button"
			@click="dropdownOpen = !dropdownOpen" :aria-expanded="dropdownOpen.toString()">
			<div class="d-flex align-items-center">
				<div class="icon-container">
					<img :src="currentSelection ? getSummonerIcon(currentSelection.profileIconId) : defaultIcon"
						alt="Summoner Icon" class="rounded-circle icon-image">
				</div>
				<div class="text-container d-flex justify-content-center">
					<span class="text-light truncate-text">{{ currentSelection?.gameName || 'SelectSummowwwwwner' }}</span>
					<span class="text-secondary ms-1 text-uppercase">#{{ currentSelection?.tagLine || ''
					}}</span>
				</div>
			</div>
		</button>

		<div class="dropdown-menu" :class="{ 'show': dropdownOpen }">
			<div class="dropdown-header">Account</div>
			<div v-for="detail in allPlayerDetails" :key="detail.puuid" class="dropdown-item position-relative"
				@click="selectSummoner(detail)">
				<img :src="getSummonerIcon(detail.profileIconId)" alt="Summoner Icon" class="icon-menu-image">
				<span class="ms-2">{{ detail.gameName }}</span>
			</div>
		</div>
	</div>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { getUrlHelper } from '../globalSetup.js'; // Adjust path as needed
const store = useStore();

const dropdownContainer = ref(null);
const dropdownOpen = ref(false);
const currentSelection = computed(() => store.getters['summoner/getCurrentSummoner']);

const allPlayerDetails = computed(() => store.getters['summoner/getAllPlayerDetails']);
// Somewhere in your Vue component

const getSummonerIcon = (iconId) => {
	const urlHelper = getUrlHelper();
	return urlHelper.getSummonerIconUrl(iconId);
};

function toggleDropdown() {
	dropdownOpen.value = !dropdownOpen.value;
}

function handleClickOutside(event) {
	if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
		dropdownOpen.value = false;
	}
}
function selectSummoner(summonerDetail) {
	currentSelection.value = summonerDetail;
	store.commit('summoner/setCurrentSummoner', summonerDetail);
	dropdownOpen.value = false;
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
	  if (!allPlayerDetails.value.length) {
	    store.dispatch('summoner/fetchSummonerDataByAccountId');
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


.dropdown-menu.show {
	display: block;
}

.icon-image {
	width: 35px;
	height: 35px;
	border: 2px solid #c0c0c0;
}

.icon-menu-image {
	width: 25px;
	height: 25px;
	border-radius: 50%;
	border: 1px solid #c0c0c0;
}

.level-pill {
	position: absolute;
	bottom: -5px;
	left: 5px;
	background-color: #000000;
	color: #d3d3d3;
	padding: 0px 6px;
	border-radius: 10px;
	font-size: 0.65rem;
	font-weight: bold;
}

.dropdown-toggle {
	background: var(--navbar-background-elements);
	border: none;
	width: 200px;
	border-radius: 6px 6px 0 0;
}

.icon-container {
	flex-shrink: 0;
	margin-right: 8px;
	/* Add some space between the icon and the text */
}

.text-container {
	flex-grow: 1;
	overflow: hidden;
	/* Hide overflow inside this container */
}

.truncate-text {
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}


.dropdown-menu {
	background: var(--navbar-background-elements);
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
	box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.dropdown-item .flex-grow-1 {
	display: flex;
	flex-direction: column;
}

.dropdown-item,
.dropdown-header {
	font-size: .875rem;
	color: inherit;
}

.dropdown-header {
	font-size: 0.875rem;
	text-transform: uppercase;
}

.dropdown-item:hover,
.dropdown-item:focus {
	background: rgba(45, 57, 65, 0.395);
	color: inherit;
}
</style>
  