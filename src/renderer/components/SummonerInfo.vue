<template>
	<div class="summoner-display" ref="dropdownContainer">
		<button class="btn dropdown-toggler d-flex align-items-center justify-content-center text-secondary"
			@click="dropdownOpen = !dropdownOpen" :aria-expanded="dropdownOpen.toString()">
			<div class="d-flex">
				<div class="icon-container">
					<img :src="currentSelection ? getSummonerIcon(currentSelection.profileIconId) : defaultIcon"
						alt="Summoner Icon" class="rounded-circle icon-image">
				</div>
				<div class="text-container d-flex justify-content-center">
					<span class="text-light truncate-text">{{ currentSelection?.gameName || 'Select Summoner' }}</span>
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
const allPlayerDetails = computed(() => store.getters['summoner/getAllPlayerDetails']);

const currentSelection = computed(() => {
	// Get the current summoner; if not found, use the first entry from allPlayerDetails
	const current = store.getters['summoner/getCurrentSummoner'];
	return current ?? allPlayerDetails.value[0]; // Make sure allPlayerDetails is not empty before accessing
});

const getSummonerIcon = (iconId) => {
	const urlHelper = getUrlHelper();
	return urlHelper.getSummonerIconUrl(iconId);
};
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
	cursor: pointer;
	display: inline-block;
	position: relative;
	max-height: 35px;
}

.summoner-display .btn {
	height: 100%;
	width: 100%;
	border-radius: 6px;
}

.dropdown-menu.show {
	display: block;
}

.icon-image {
	width: 25px;
	height: 25px;
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

.icon-container {
	flex-shrink: 0;
	margin-right: 8px;
}

.text-container {
	flex-grow: 1;
	overflow: hidden;
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
