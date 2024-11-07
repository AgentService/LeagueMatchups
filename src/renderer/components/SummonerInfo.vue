<template>
	<div class="dropdown summoner-display" @mouseover="clearCloseDropdownTimeout" @mouseleave="setCloseDropdownTimeout"
		:aria-expanded="dropdownOpen.toString()">
		<button class="btn dropdown-toggler" href="#" role="button" aria-expanded="false">
			<div class="d-flex align-items-center">
				<img :src="currentSelection ? getSummonerIcon(getSummonerProfileIcon(currentSelection)) : getSummonerIcon(5541)"
					alt="Summoner Icon" class="rounded-circle icon-image me-2">
				<span class="text-light">{{ getSummonerName(currentSelection) || 'Summoner' }}</span>
				<span class="text-secondary ms-1 tag">#{{ getSummonerTagLine(currentSelection) || '' }}</span>
			</div>
			<ul class="dropdown-menu mt-2" :class="{ 'show': dropdownOpen }">
				<!-- <li class="dropdown-header">Summoner</li> -->
				<!-- <li>
					<hr class="dropdown-divider">
				</li> -->
				<li v-for="detail in uniquePlayerDetails" :key="detail.apiResponse.puuid"
					@click="selectSummoner(detail)">
					<a class="dropdown-item d-flex align-items-center">
						<img :src="getSummonerIcon(getSummonerProfileIcon(detail))" alt="Summoner Icon"
							class="icon-menu-image me-2">
						<span>{{ detail.apiResponse?.gameName || detail.webSocketResponse?.gameName }}</span>
						<span class="text-secondary ms-1 tag">#{{ getSummonerTagLine(detail) }}</span>
					</a>
				</li>
			</ul>
		</button>
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

const uniquePlayerDetails = computed(() => {
	const uniqueSummoners = new Map();
	allPlayerDetails.value.forEach(detail => {
		const uniqueKey = `${detail.gameName}#${detail.tagLine}`;
		if (!uniqueSummoners.has(uniqueKey)) {
			uniqueSummoners.set(uniqueKey, detail);
		}
	});
	return Array.from(uniqueSummoners.values());
});

const currentSelection = computed(() => {
	const currentSummoner = store.getters['summoner/getCurrentSummoner'];
	if (!currentSummoner && uniquePlayerDetails.value.length > 0) {
		return uniquePlayerDetails.value[0];
	}
	return currentSummoner ? currentSummoner : null;
});

// Helper function to get summoner icon, fallback if missing
const getSummonerProfileIcon = (summonerDetail) => {
	return summonerDetail?.webSocketResponse?.profileIconId || summonerDetail?.apiResponse?.profileIconId || 5541;
};

// Helper function to get summoner name from either WebSocket or API
const getSummonerName = (summonerDetail) => {
	return summonerDetail?.webSocketResponse?.gameName || summonerDetail?.apiResponse?.gameName || 'Summoner';
};

// Helper function to get summoner tag line
const getSummonerTagLine = (summonerDetail) => {
	return summonerDetail?.webSocketResponse?.tagLine || summonerDetail?.apiResponse?.tagLine || '';
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
}

function fetchSummonerData(summonerData) {
	if (summonerData) {
		// First, try fetching from the local database
		store.dispatch('summoner/fetchSummonerDataBySummonerData', summonerData)
			.then((data) => {
				if (!data) {
					// If no data is found, fetch from Riot API and create an entry
					store.dispatch('summoner/fetchSummonerData', {
						region: 'europe',
						gameName: summonerData.gameName,
						tagLine: summonerData.tagLine,
					});
				}
			});
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
