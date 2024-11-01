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
const gameName = computed(() => store.state.summoner.currentSummoner?.summonerNameValue);
const tagLine = computed(() => store.state.summoner.currentSummone?.tagLine);
const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
const closeDropdownTimeout = ref(null);

const uniquePlayerDetails = computed(() => {
	const uniqueSummoners = new Map();
	allPlayerDetails.value.forEach(detail => {
		const uniqueKey = `${detail.apiResponse?.gameName}#${detail.apiResponse?.tagLine}`;
		if (!uniqueSummoners.has(uniqueKey)) {
			uniqueSummoners.set(uniqueKey, detail);
		}
	});
	return Array.from(uniqueSummoners.values());
});


const currentSelection = computed(() => {
	const currentSummoner = store.getters['summoner/getCurrentSummoner'];
	// If there's no current summoner, fallback to the first entry in playerDetails
	return currentSummoner ? currentSummoner : allPlayerDetails.value.length ? allPlayerDetails.value[0] : null;
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


function fetchSummonerDetailsIfNeeded(gameName2, tagLine2) {
	if (gameName && tagLine) {
		// First, try fetching from the local database
		store.dispatch('summoner/fetchSummonerDataByAccountId').then((data) => {
			if (!data) {
				// If no data is found, fetch from Riot API and create an entry
				store.dispatch('summoner/fetchSummonerData', {
					region: 'europe',
					gameName: gameName.value || gameName2,
					tagLine: tagLine.value || tagLine2,
				});
			}
		});
	}
}

// Listen for client connection status from the main process
window.api.receive("client-status", (status) => {
	if (status.connected) {
		console.log("League client connected, triggering summoner data fetch...");
		// Call this function only if client is connected
		window.api.send("get-summoner-name"); // Request summoner name from client
	}
});

// Listen for summoner name from main process
window.api.receive("summoner-name-response", (summonerData) => {
	if (summonerData && summonerData.gameName) {
		console.log("Summoner data received from client:", summonerData);
		// Trigger the check or fetch flow with summoner name and tag line
		fetchSummonerDetailsIfNeeded(summonerData.gameName, summonerData.tagLine);
	} else {
		console.error("Invalid summoner data received from client");
	}
});

watch(isLoggedIn, (newVal, oldVal) => {
	if (newVal && !oldVal) {
		console.log("User logged in, fetching summoner details once.");
		setTimeout(() => {
			fetchSummonerDetailsIfNeeded();
		}, 200); // Optional: Delay to prevent immediate double triggers
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
