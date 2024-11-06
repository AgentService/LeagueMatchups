<template>
	<div class="app-wrapper">

		<div v-if="isLoading" class="loading-indicator">Loading...</div>
		<div v-else class="app-container">
			<div class="grid-container ">
				<div class="container-fluid ">
					<div class="row">
						<div class="col-xxl-12 col-xl-12 mt-4 ">
							<transition name="slide-down" mode="out-in">
								<div v-if="currentPhase">
									<div class="d-flex justify-content-between align-items-center w-100 text-light">
										<transition name="slide-up" mode="out-in">
											<div v-if="playerLocked" class="locked-indicator" key="locked">
												<span>Locked</span>
											</div>
											<div v-else-if="playerTurn" class="locked-indicator" key="empty">
												<span>Select your Champion</span>
											</div>
											<div v-else class="locked-indicator">
												<span></span>
											</div>
										</transition>
										<transition name="slide-up" mode="out-in">
											<div :key="currentPhase" class="phase-text">
												{{ phaseText }}
											</div>
										</transition>
										<transition name="slide-up" mode="out-in">
											<div v-if="playerTurn" class="timer">
												<div>{{ formatTime(timerValue) }}</div>
											</div>
											<div v-else class="timer">
												<div></div>
											</div>
										</transition>
									</div>
									<div class="teams-container">
										<div class="my-team">
											<div v-for="championId in myTeamPicks" :key="championId">
												<img :src="myTeamImageUrls[championId]" alt="Champion icon"
													class="champion-icon" />
											</div>
										</div>
										<div class="enemy-team">
											<div v-for="championId in enemyTeamPicks" :key="championId"
												class="champion-icon">
												<img :src="enemyTeamImageUrls[championId]" alt="Champion icon"
													class="champion-icon" />
											</div>
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
					<div class="row align-items-start ">
						<div class="col-xxl-2 col-xl-2 mt-4">
							<div class="card-widget">
								<LatestNoteWidget />
							</div>
							<div class="card-tips mt-2">
								<ChampionTips :champion="championA" />
							</div>
						</div>
						<div class="col-xxl-8 col-xl-8">
							<div class="row mb-0 mt-4">
								<div class="col-xxl-6 ">
									<div class="d-flex flex-row justify-content-evenly ">
										<div class="card-large" :class="{ 'ban-pick-border-animation': playerTurn }">
											<ChampionSearch :instanceId="1" @championSelected="setChampionA" />
										</div>

									</div>
								</div>

								<div class="col-xxl-6">
									<div class="card-large">
										<ChampionSearch :instanceId="2" @championSelected="setChampionB" />
									</div>
								</div>
								<div class="vs-container">
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
								<div class="col-xxl-8">
									<PostGameReviewHistory />
								</div>
								<div class="col-xxl-4">
									<!-- <LearningObjectives /> -->
								</div>
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
		const champion = championDetails[pick]; // Access directly by ID if `championDetails` is a map by champion ID

		if (champion) {
			const imageUrl = await getChampionImageSource('small', champion.id);
			teamImageUrls.value[pick] = imageUrl; // Store using champion ID for direct template access
			debug(`updateTeamImageUrls: ${pick} - ${imageUrl}`);
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

	const cleanupPicked = window.ws.receive("champion-picked", () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		playerLocked.value = true;
		playerTurn.value = false;
		timerValue.value = 0; // Reset the timer display
	});

	// Add each cleanup function to the `cleanups` array
	cleanups.push(cleanupPhaseUpdate, cleanupPickTurn, cleanupPicked, cleanupTeamSelect);
});
onUnmounted(() => {
	// Clear the interval if it exists
	if (intervalId) {
		clearInterval(intervalId);
	}

	// Call each cleanup function to remove event listeners
	cleanups.forEach(cleanup => cleanup());
});

const championA = ref(null);
const championB = ref(null);

const store = useStore();
let bothSelected = false;

const handleMatchup = () => {
	if (championA.value && championB.value) {
		if (!bothSelected) {
			bothSelected = true;
			const championA_name = championA.value.name;
			const championB_name = championB.value.name;

			if (championA_name === championB_name) {
				alert("Cannot create a matchup with the same champion.");
				bothSelected = false; // Reset bothSelected to allow another selection
				return;
			}

			// Construct a unique matchupKey based on champion names
			const matchupKey = `${championA_name}-${championB_name}`;

			const matchup = {
				id: matchupKey,
				champions: [championA.value, championB.value],
			};

			debug(`handleMatchup: ${JSON.stringify(matchupKey)} - ${JSON.stringify(matchup.champions[0].name)} vs ${JSON.stringify(matchup.champions[1].name)}`);
			// Dispatch matchup to the store
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

<style>

</style>