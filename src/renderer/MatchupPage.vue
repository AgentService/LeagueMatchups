<template>
	<div class="app-wrapper">
		<div v-if="isLoading" class="flex justify-center items-center min-h-screen text-2xl">
			Loading...
		</div>

		<div v-else class="app-container p-4">
			<div class="container-fluid">

				<div class="row">
					<div class="col-xxl-12 col-xl-12 mt-4"></div>
				</div>

				<div class="row align-items-start">

					<div class="col-xxl-8 col-xl-8">
						<div class="row mb-0">

							<div class="col-xxl-6">
								<div class="d-flex flex-row justify-content-evenly">
									<!-- Use Tailwind for the card styling, and Headless UI for interactivity if needed -->
									<div class="card-large p-4 bg-gray-100 shadow-md rounded-lg"
										:class="{ 'ban-pick-border-animation': playerTurn }">
										<ChampionSearch :instanceId="1" @championSelected="setChampionA" />
									</div>
								</div>
							</div>

							<div class="col-xxl-6">
								<div class="card-large p-4 bg-gray-100 shadow-md rounded-lg">
									<ChampionSearch :instanceId="2" @championSelected="setChampionB" />
								</div>
							</div>

							<div class="vs-container text-white text-4xl absolute transform scale-75 top-14 right-1/2">
								<span>vs</span>
							</div>
						</div>

						<div class="row mb-4">
							<div class="col-xxl-6">
								<ChampionNotes />
							</div>
							<div class="col-xxl-6">
								<MatchupNotes />
							</div>
						</div>

						<div class="row">
							<div class="col-xxl-10">
								<LearningObjectives />
							</div>
							<div class="col-xxl-2">
								<!-- Other components like PostGameReview could go here if needed -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import ImageUrlHelper from './utils/imageHelper';

// Debug
import Debug from 'debug';

import ChampionSearch from './components/ChampionSelection.vue';
import ChampionTips from './components/ChampionTips.vue';
import SummonerInfo from './components/SummonerInfo.vue';
import SummonerRankedInfo from './components/SummonerRankedInfo.vue';
import LearningObjectives from "./components/LearningObjectives.vue";

import ChampionNotes from './components/ChampionNotes.vue';
import LatestNoteWidget from './components/reuse/LatestNoteWidget.vue';

import MatchupNotes from './components/MatchupNotes.vue';

import MatchHistory from './components/MatchHistory.vue';
import DailyNotes from './components/DailyNotes.vue';
import EndOfGameQuestions from './components/EndOfGameQuestions.vue';
import PostGameReview from './components/PostGameReview.vue';
import PostGameReviewHistory from './components/PostGameReviewHistory.vue';

import { on } from 'events';


const debug = Debug('app:component:ChampionPage');
const imageUrlHelper = new ImageUrlHelper();

const isLoading = ref(true);
const currentPhase = ref('');
const timerValue = ref(0);
const playerTurn = ref(false);
const playerLocked = ref(false);
const myTeamPicks = ref([]);
const enemyTeamPicks = ref([]);

let intervalId; // Keep track of the interval ID for clearing later
let cleanups = []; // Store cleanup functions

// Reactive properties for image URLs
const myTeamImageUrls = ref({});
const enemyTeamImageUrls = ref({});

const getChampionImageSource = async (size, championId) => {
	return imageUrlHelper.getChampionImageSource(size, championId);
};

const updateTeamImageUrls = async (teamPicks, teamImageUrls) => {
	const championDetails = store.state.champions.championDetails;

	for (const pick of teamPicks) {
		// Ensure we're comparing like types, convert number IDs to strings
		debug("pick", pick);
		const championKeyAsString = pick.toString();

		// Find the champion object by its key
		const champion = Object.values(championDetails).find(champ => champ.key === championKeyAsString);

		if (champion) {
			// Use the champion ID to fetch and store the image URL
			const imageUrl = await getChampionImageSource('small', champion.id);
			// Now, correctly use teamImageUrls parameter to update
			teamImageUrls.value[pick.championId] = imageUrl; // Store using the numeric ID for direct template access
			debug(`updateTeamImageUrls: ${pick} - ${imageUrl}`);
			debug("updateTeamImageUrls:", teamImageUrls);
		}
	}
};

const phaseText = computed(() => {
	switch (currentPhase.value) {
		case "PLANNING":
			return "Planning Phase";
		case "BAN_PICK":
			return "Pick & Ban";
		case "FINALIZATION":
			return "Prepare your Loadout";
		default:
			playerLocked.value = false;
			return "Waiting for Champ Select";
	}
});

async function fetchData() {
	// Simulate fetching data
	isLoading.value = false;
}

function formatTime(seconds) {
	if (seconds === null) return '';
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function startTimer(durationMs) {
	if (intervalId) clearInterval(intervalId); // Clear any existing timer to prevent overlaps

	timerValue.value = Math.floor(durationMs / 1000); // Initialize timer with duration in seconds

	intervalId = setInterval(() => {
		if (timerValue.value > 0) {
			timerValue.value -= 1;
		} else {
			clearInterval(intervalId);
			intervalId = null; // Reset the interval ID for future use
		}
	}, 1000);
}

const updateTeamPicks = async ({ myTeam, theirTeam }) => {
	// Extract championIds from the objects
	const myTeamIds = myTeam.map(pick => pick.championId);
	const theirTeamIds = theirTeam.map(pick => pick.championId);

	// Assuming updateTeamImageUrls is designed to work with arrays of IDs
	await updateTeamImageUrls(myTeamIds, myTeamImageUrls); // Update to match your actual implementation
	await updateTeamImageUrls(theirTeamIds, enemyTeamImageUrls); // Update to match your actual implementation
};

onMounted(async () => {
	fetchData();

	const cleanupTeamSelect = window.ws.receive("champ-select-team-picks-update", ({ myTeam, theirTeam }) => {
		debug(`Received team picks: ${JSON.stringify(myTeam)} - ${JSON.stringify(theirTeam)}`);
		updateTeamPicks({ myTeam, theirTeam });
	});

	const cleanupPhaseUpdate = window.ws.receive("champ-select-phase-update", ({ phase, timeLeft }) => {
		debug(`Received phase update: ${phase} - ${timeLeft}`);
		currentPhase.value = phase;
	});

	const cleanupPickTurn = window.ws.receive("champ-select-local-player-pick-turn", (timeInMs) => {
		playerTurn.value = true;
		startTimer(timeInMs);
	});

	// Handling the 'champion-picked' event to reset the timer and update states
	const cleanupPicked = window.ws.receive("champion-picked", () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		playerLocked.value = true;
		playerTurn.value = false;
		timerValue.value = 0; // Reset the timer display
	});
	cleanups.push(cleanupPhaseUpdate, cleanupPickTurn, cleanupPicked, cleanupTeamSelect);
});

onUnmounted(() => {
	if (intervalId) {
		clearInterval(intervalId);
	}
	cleanups.forEach(cleanup => cleanup()); // Call each cleanup function
});

const championA = ref(null);
const championB = ref(null);

const store = useStore();
let bothSelected = false;

const handleMatchup = () => {
	if (championA.value && championB.value) {
		if (!bothSelected) {
			bothSelected = true;
			const championA_name = championA.value.name; // Assuming .id is the unique identifier
			const championB_name = championB.value.name;

			if (championA_name === championB_name) {
				alert("Cannot create a matchup with the same champion.");
				return;
			}

			// Construct a unique matchupKey based on champion IDs
			const matchupKey = `${championA_name}-${championB_name}`;

			// Now the matchup object uses champion IDs
			const matchup = {
				id: matchupKey, // Still using matchupKey as a unique identifier for ease of reference
				champions: [championA.value, championB.value], // Retaining champions data for additional context
			};

			debug(`handleMatchup: ${JSON.stringify(matchupKey)} - ${JSON.stringify(matchup.champions[0].name)} vs ${JSON.stringify(matchup.champions[1].name)}`);
			// Dispatching with matchup ID and champion details
			store.dispatch('matchups/handleMatchupCreation', matchup);
		}
	} else {
		bothSelected = false;
	}
};

const setChampionA = (champion) => {
	championA.value = champion;
	store.dispatch('matchups/setChampionA', champion);
	store.dispatch('champions/fetchChampionTips', { championId: champion.id });
	// store.dispatch('notes/fetchChampionPersonalNotes', champion.id);

};

const setChampionB = (champion) => {
	championB.value = champion;
	store.dispatch('matchups/setChampionB', champion);
};

watch([championA, championB], ( /* newValues, oldValues */) => {
	bothSelected = false;
	handleMatchup();
});
</script>

<style scoped>
.vs-container {
	display: flex;
	justify-content: center;
	align-items: start;
	position: absolute;
	z-index: auto;
	font-size: 4rem;
	top: 14%;
	right: 49%;
	width: 10px !important;
	height: 40px;
	padding: 1rem;
	color: #fff;
	text-shadow: 0 0 5px #00ffeacd, 0 0 10px #00ffeac2, 0 0 20px #00ffeac3;
	transform: scale(.775);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	user-select: none;
}

.vs-container:hover {
	cursor: default;
}
</style>