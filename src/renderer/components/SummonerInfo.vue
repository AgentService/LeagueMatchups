<template>
	<div ref="dropdownContainer" class="dropdown summoner-display" @mouseover="clearCloseDropdownTimeout"
		@mouseleave="setCloseDropdownTimeout" :aria-expanded="dropdownOpen.toString()">
		<button class="btn dropdown-toggler" @click="toggleDropdown" role="button" aria-expanded="false">
			<div class="d-flex align-items-center">
				<img :src="currentSelection ? getSummonerIcon(getSummonerProfileIcon(currentSelection)) : getSummonerIcon(5541)"
					alt="Summoner Icon" class="rounded-circle icon-image me-2">
				<span class="text-light">{{ getSummonerName(currentSelection) || 'Summoner' }}</span>
				<span class="text-secondary ms-1 tag">#{{ getSummonerTagLine(currentSelection) || '' }}</span>
			</div>
		</button>
		<ul class="dropdown-menu" :class="{ 'show': dropdownOpen }">
			<!-- Use apiResponse.puuid as the unique key -->
			<li v-for="detail in allPlayerDetails" :key="detail.apiResponse.puuid" @click="selectSummoner(detail)">
				<a class="dropdown-item d-flex align-items-center">
					<img :src="getSummonerIcon(getSummonerProfileIcon(detail))" alt="Summoner Icon"
						class="icon-menu-image me-2">
					<span>{{ getSummonerName(detail) }}</span>
					<span class="text-secondary ms-1 tag">#{{ getSummonerTagLine(detail) }}</span>
				</a>
			</li>
		</ul>
	</div>
</template>



<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useStore } from 'vuex';
import { getUrlHelper } from '../globalSetup.js';

const store = useStore();

const dropdownContainer = ref(null);
const dropdownOpen = ref(false);
const allPlayerDetails = computed(() => store.getters['summoner/getAllPlayerDetails']);
const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
const closeDropdownTimeout = ref(null);

const currentSelection = computed(() => store.getters['summoner/getCurrentSummoner']);

watch(currentSelection, (newSelection) => {
	console.log("Updated currentSelection:", newSelection);

	if (!store.getters['summoner/getCurrentSummoner'] && newSelection) {
		store.commit('summoner/setCurrentSummoner', newSelection);
	}
});

// Helper function to get summoner icon, fallback if missing
const getSummonerProfileIcon = (summonerDetail) => {
	return summonerDetail?.apiResponse?.profileIconId || 5541;
};

// Helper function to get summoner name from either API or WebSocket
const getSummonerName = (summonerDetail) => {
	return summonerDetail?.apiResponse?.gameName || 'Summoner';
};

// Helper function to get summoner tag line
const getSummonerTagLine = (summonerDetail) => {
	return summonerDetail?.apiResponse?.tagLine || '';
};


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
	store.commit('summoner/setCurrentSummoner', summonerDetail);
	dropdownOpen.value = false;
	console.log("Current Summoner Updated:", summonerDetail);
}


async function fetchSummonerData(summonerData) {
	if (!summonerData) return;

	try {
		// Dispatch a single action that handles both database checking and API fetching if needed
		await store.dispatch('summoner/fetchOrUpdateSummonerData', summonerData);
	} catch (error) {
		console.error("Error in fetchSummonerData:", error);
	}
}

// Listen for client connection status from the main process
window.api.receive("client-status", (status) => {
	if (status.connected) {
		console.log("League client connected, triggering summoner data fetch...");
		// Request summoner name from client
		window.api.send("get-summoner-name");
	}
});

// Listen for summoner name from main process
window.api.receive("summoner-name-response", (summonerData) => {
	if (summonerData && summonerData.gameName && summonerData.tagLine) {
		console.log("Summoner data received from client:", summonerData);
		// Trigger the check or fetch flow with summoner name and tag line
		fetchSummonerData(summonerData);
	} else {
		console.error("Invalid summoner data received from client");
	}
});

watch(isLoggedIn, (newVal, oldVal) => {
	if (newVal && !oldVal) {
		console.log("User logged in, waiting for summoner data from client...");
		// Optionally, reset currentSummoner or perform other tasks
	}
});

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
	if (closeDropdownTimeout.value) {
		clearTimeout(closeDropdownTimeout.value);
	}
	document.removeEventListener('click', handleClickOutside);
});
</script>


<style scoped>
.icon-image,
.icon-menu-image {
	width: 25px;
	height: 25px;
	border-radius: 50%;
	border: 2px solid #c0c0c0;
}

.dropdown-menu {
	margin-top: -2px;
	border-top: 0;
	border-radius: 0 0 12px 12px;
}

.dropdown-menu.show {
	display: block;
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

.tag {
	text-transform: uppercase;
}
</style>
