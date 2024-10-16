<template>
	<div class="app-wrapper">

		<div v-if="isLoading" class="loading-indicator">Loading...</div>

		<div v-else class="app-container">

			<div class="grid-container">

				<div class="container-fluid">

					<div class="row">

						<div class="col-xxl-12 col-xl-12 mt-4">

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

					<div class="row align-items-start">

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

								<div class="col-xxl-6">

									<div class="d-flex flex-row justify-content-evenly">

										<div class="card-large" :class="{ 'ban-pick-border-animation': playerTurn }">

											<ChampionSearch :instanceId="1" @championSelected="setChampionA" />

										</div>

										<div class="vs-container">

											<span>vs</span>

										</div>

									</div>

								</div>

								<div class="col-xxl-6">

									<div class="card-large">

										<ChampionSearch :instanceId="2" @championSelected="setChampionB" />

									</div>

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

								<div class="col-xxl-6">
									<PostGameReviewHistory />
								</div>
								<div class="col-xxl-6">
									<!-- <PostGameReview /> -->
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

<style>
.teams-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 1000;
}

.my-team,
.enemy-team {
	display: flex;
}

.champion-icon {
	width: 50px;
	height: auto;
	background: var(--hextech-black);
	border: 0px solid var(--blue-7);
}

.widget-footer {
	bottom: -5px;
	right: -2px;
	display: flex;
	position: absolute;
	justify-content: end;
	color: var(--grey-1);
	font-size: 0.85rem;
}

.widget-header {
	padding-bottom: 0.25rem;
	margin-bottom: 0rem;
	display: flex;
	font-size: 0.9rem;
	align-items: center;
	width: 100%;
	color: var(--gold-3);
	border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.widget-header-title {
	font-weight: 600;
}

.widget-header-right {
	margin-left: auto;
	font-weight: 400;
	font-size: 0.75rem;
	color: var(--grey-1);
}

.champion-select-widget {
	color: #fff;
	padding: 10px;
	border-radius: 8px;
	height: 50px;
}

.placeholder {
	visibility: hidden;
}

.locked-indicator,
.timer,
.enemy-picks {
	width: 10%;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
}

.phase-text {
	width: 20%;
	text-align: center;
}

/* If a section might be empty but you still want to reserve the space */

.locked-indicator {
	min-height: 60px;
}

/* Assuming enemy picks might have multiple items */

.enemy-picks {
	display: flex;
	justify-content: space-around;
	/* Adjust layout of enemy picks */
}

/* Transitions */

.slide-down-enter-active,
.slide-down-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.5s ease;
}

.slide-down-enter-from,
.slide-up-leave-to {
	transform: translateY(-100%);
}

.slide-down-leave-to,
.slide-up-enter-from {
	transform: translateY(100%);
}

.ban-pick-border-animation {
	animation: pulseBorder 2s infinite;
}

@keyframes pulseBorder {
	0% {
		border-color: transparent;
	}

	50% {
		border-color: var(--blue-laser-2);
	}

	100% {
		border-color: transparent;
	}
}

.loading-indicator {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	/* Full viewport height */
	font-size: 20px;
}

/* Save and delete buttons */

.save-button,
.add-button,
.delete-button {
	align-items: flex-end;
	color: var(--grey-1);
}

.save-button:hover,
.add-button:hover,
.delete-button:hover,
.show-more-button:hover {
	opacity: 1;
	color: var(--gold-2);
	background: var(--grey-cool);
}

.buttons-container {
	display: flex;
	gap: 5px;
}

.vs-container {
	display: flex;
	justify-content: center;
	align-items: start;
	position: absolute;
	z-index: 2;
	font-size: 4rem;
	top: 14%;
	right: 40.8%;
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

.card-container-header {
	text-transform: uppercase;
	text-align: start;
	font-size: 1.1rem;
	padding: .5rem;
	padding-top: 0rem;
	display: flex;
	color: var(--gold-4);
}

.card-container {
	display: flex;
	flex-direction: column;
	border-radius: 12px;
}

.card {
	position: relative;
	display: flex;
	flex-direction: column;
	border: 0 !important;
	border-radius: 0 !important;
	background-color: transparent !important;
	color: #e7e7e7;
	padding: 1rem;
	max-height: 390px;
	min-height: 390px;
	z-index: auto;
}

.card-small {
	position: relative;
	display: flex;
	border-bottom: 0;
	border-radius: 0;
	flex-direction: column;
	background-image: linear-gradient(to right, #091014, #091014);
	color: #e7e7e7;
	padding: .5rem 1.25rem;
	max-height: 250px;
	min-height: 250px;
	z-index: auto;
}

.card-large {
	user-select: none;
	position: relative;
	display: flex;
	flex-direction: column;
	color: var(--gold-1);
	padding: 1rem 1rem;
	max-height: 320px;
	min-height: 320px;
	width: 100%;
	z-index: auto;
	border-radius: 12px 12px 0 0;
	border: 1px solid rgba(128, 128, 128, 0.1);
	border-bottom: 0;
	background-image: linear-gradient(to right, #091014, #091014);
}

.card-wide {
	user-select: none;
	position: relative;
	display: flex;
	flex-direction: column;
	background-image: linear-gradient(to right, #091014, #091014);
	color: var(--gold-1);
	padding: 1rem 1rem;
	z-index: 0;
}

.card-widget {
	flex-direction: column;
	user-select: none;
	position: relative;
	display: flex;
	color: var(--gold-1);
	background-image: linear-gradient(to right, #091014, #091014);
	z-index: 0;
	border-radius: 12px;
	cursor: pointer;
	transition: box-shadow 0.3s ease-in-out;
	padding: 1rem;
}

.card-tips {
	flex-direction: column;
	user-select: none;
	position: relative;
	display: flex;
	color: var(--gold-1);
	background-image: linear-gradient(to right, #091014, #091014);
	z-index: 0;
	border-radius: 12px;
	transition: box-shadow 0.3s ease-in-out;
	padding: 1rem 1rem;
	min-height: 360px;
	max-height: 360px;
}

.card-widget:hover {
	background-color: #214153;
	/* Slightly darker on hover to indicate interactivity */
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	/* Elevated shadow on hover */
}

.card-fluid {
	user-select: none;
	position: relative;
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(128, 128, 128, 0.1);
	background-image: linear-gradient(to right, #091014, #091014);
	padding: 1rem 1rem;
	min-height: 440px;
	max-height: 440px;
}

.notes-body {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	padding: .5rem;
}

* {
	box-sizing: border-box;
}

.title-bar {
	display: flex;
	justify-content: start;
	align-items: center;
	color: var(--gold-3);
}

.title-bar h5 {
	margin: 0;
	padding: 0.5rem 0;
}

.app-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin: 0 auto;
	width: 100%;
	max-width: 1920px;
	min-height: 100%;
}

.app-container {
	flex: 1;
	position: relative;
	align-items: center;
	flex-grow: 1;
}

.grid-container {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
}

.row {
	display: flex;
	justify-content: center;
}

.row2 {
	display: flex;
	justify-content: center;
}

.background-container {
	position: static;
	height: auto;
	opacity: 1;
}

.row.front {
	z-index: 0;
}

@media (max-height: 1440px) {
	.background-container {
		height: 100%;
	}

	.card-container {
		max-height: 100%;
	}
}

.gradient-top-border::after {
	content: "";
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	height: 2px;
	background: var(--border-grey-gradient-horizontal);
	z-index: 2;
}

.gradient-border1::before {
	content: "";
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	width: 1px;
	background: var(--border-grey-gradient);
	z-index: 2;
}

/* Gradient Border Class for right border */

.gradient-border2::after {
	content: "";
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
	width: 1px;
	background: var(--border-grey-gradient);
	z-index: 2;
}

/* Gradient Border Laser Class for vertical border */

.gradient-border-laser::after {
	content: "";
	position: absolute;
	top: 20%;
	bottom: 20%;
	left: 0;
	width: 1px;
	background: linear-gradient(to top, #000406, var(--gold-3), var(--gold-3), #000406);
	z-index: 0;
}

.gradient-border:not(:last-child)::after {
	display: none;
	/* This hides the right border for all but the last child */
}

.gradient-border:not(:first-child)::before {
	display: none;
	/* This hides the left border for all but the first child */
}

.card-header-custom {
	background-color: transparent;
	font-weight: 600;
	text-align: start;
	padding-bottom: 0.5rem;
	margin-bottom: 0.5rem;
	display: flex;
	color: var(--gold-3);
	border-bottom: 1px solid rgba(128, 128, 128, 0.1);
	user-select: none;
}

.tab-header {
	background-color: transparent;
	font-weight: 600;
	font-size: 1rem;
	margin: 1.5rem 0;
	color: var(--gold-1);
}

.active-border {
	background-color: #04D9FF;
	width: 20%;
	margin: 0.5rem 0;
	align-self: center;
	height: 3px;
}
</style>