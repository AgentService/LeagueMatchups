<template>
	<div class="app-wrapper">
		<div v-if="isLoading" class="loading-indicator">Loading...</div>
		<div v-else class="app-container">
			<div class="background-container ">
				<!--
        <img v-if="championA" :src="`/img/champion_splash/${championA.id}.png`" class="background-image left mirrored-image" alt="Champion A" />
        <img v-if="championB" :src="`/img/champion_splash/${championB.id}.png`" class="background-image right" alt="Champion B" />
        -->
			</div>
			<div class="grid-container ">
				<div class="container-fluid">
					<!-- Summoner Info Row -->
					<div class="row">
						<div class="col-9">
							<!-- <SummonerInfo /> -->
						</div>
					</div>
					<div class="row justify-content-evenly">
						<!-- <div class="col-xxl-3 col-xl-3">
							<div class="card">
								<ChampionTips :champion="championA" />
							</div>
							<div class="card">
							</div>
							<div class="card">
							</div>
						</div> -->
						<div class="col-xxl-10 col-xl-10 mt-4">

							<div class="card-container">

								<div class="row ">
									<!-- Champion Search for User's Champion -->
									<!-- <div class="col-xxl-2 col-xl-2">
										<div class="card">
											<SummonerRankedInfo />
										</div>
										<div class="card">
											<LearningObjectives></LearningObjectives>
										</div>
									</div> -->
									<div class="col-xxl-6 m-auto">
										<div class="card-small card-top mb-0">
											<ChampionSearch :instanceId="1" @championSelected="setChampionA" />
										</div>
										<div class="card card-bottom ">
											<ChampionNotes />
										</div>
									</div>
									<!-- VS Divider -->
									<div class="vs-container">
										<span>vs</span>
									</div>
									<!-- Matchup Notes and Search for Enemy Champion -->
									<div class="col-xxl-6 m-auto">
										<div class="card-small card-top mb-0">
											<ChampionSearch :instanceId="2" @championSelected="setChampionB" />
										</div>
										<div class="card card-bottom">
											<MatchupNotes />
										</div>
									</div>
									<!-- <div class="col-xxl-2 col-xl-2">
										<div class="card">
											<SummonerRankedInfo />
										</div>
										<div class="card">
											<LearningObjectives></LearningObjectives>
										</div>
									</div> -->
								</div>
							</div>
							<div class="row">
								<div class="col-xxl-6">
									<div class="card-large card-top card-bottom">
										<GeneralNotes />
									</div>
								</div>
								<div class="col-xxl-6">
									<div class="card-large card-top card-bottom">
										<MatchHistory />
									</div>
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
import { ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

// Debug
import Debug from 'debug';

import ChampionSearch from './components/ChampionSelection.vue';
import ChampionTips from './components/ChampionTips.vue';
import SummonerInfo from './components/SummonerInfo.vue';
import SummonerRankedInfo from './components/SummonerRankedInfo.vue';
import LearningObjectives from "./components/LearningObjectives.vue";

import ChampionNotes from './components/ChampionNotes.vue';

import MatchupNotes from './components/MatchupNotes.vue';

import MatchHistory from './components/MatchHistory.vue';
import GeneralNotes from './components/GeneralNotes.vue';


const debug = Debug('app:component:ChampionPage');

const isLoading = ref(true);

async function fetchData() {
	// Simulate fetching data
	isLoading.value = false;
}

onMounted(() => {
	fetchData();
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
	store.dispatch('notes/fetchChampionPersonalNotes', champion.id);

};

const setChampionB = (champion) => {
	championB.value = champion;
	store.dispatch('matchups/setChampionB', champion);
	store.dispatch('notes/fetchChampionPersonalNotes', champion.id);
};

watch([championA, championB], (/* newValues, oldValues */) => {
	bothSelected = false;
	handleMatchup();
});

</script>

<style>
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
	opacity: 0.5;
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
	font-size: 3rem;
	top: 12%;
	right: 49.3%;
	width: 10px !important;
	height: 40px;
	padding: 1rem;
	color: #fff;
	text-shadow: 0 0 5px #00ffeacd,
		0 0 10px #00ffeac2,
		0 0 20px #00ffeac3;
	transform: scale(.775);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.vs-container:hover {
	cursor: default;
}



.card-container-header {
	text-transform: uppercase;
	font-weight: 700;
	text-align: start;
	padding: .5rem;
	padding-top: 0rem;
	display: flex;
	color: var(--gold-1);
}

.card-container {
	display: flex;
	flex-direction: column;
	background: var(--card-background);
	padding: 1.5rem;
	margin-bottom: 1rem;
	border-radius: 6px;
	border: 1px solid rgba(128, 128, 128, 0.1);
}

.card {
	position: relative;
	display: flex;
	flex-direction: column;
	border: 2px solid rgba(128, 128, 128, 0.1);
	background-image: linear-gradient(to right, #091014, #05080f);
	box-shadow: 6px 10px 14px rgba(0, 0, 1, 1);
	color: #e7e7e7;
	padding: .5rem;
	max-height: 360px;
	min-height: 360px;
	z-index: auto;
}

.card-small {
	position: relative;
	display: flex;
	flex-direction: column;
	border: 2px solid rgba(128, 128, 128, 0.1);
	background-image: linear-gradient(to right, #091014, #05080f);
	box-shadow: 6px 10px 14px rgba(0, 0, 1, 1);
	color: #e7e7e7;
	padding: .5rem;
	margin-bottom: 1rem;
	max-height: 260px;
	min-height: 260px;
	z-index: auto;
}

.card-large {
	position: relative;
	display: flex;
	flex-direction: column;
	border: 2px solid rgba(128, 128, 128, 0.1);
	background-image: linear-gradient(to right, #091014, #05080f);
	box-shadow: 6px 10px 14px rgba(0, 0, 1, 1);
	color: #e7e7e7;
	padding: 2rem 2rem;
	margin-bottom: 1rem;
	max-height: 570px;
	min-height: 570px;
	z-index: auto;
}

.card-top {
	border-radius: 6px 6px 0 0;
}

.card-bottom {
	border-radius: 0 0 6px 6px;
}

.card-header-custom h5 {
	margin: 0;
	/* Adjust as needed */
}

.notes-body {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	padding: .25rem .5rem;
}

/* Textarea for the note content */
.note-textarea {
	border-radius: 10px;
	resize: none;
	width: 100%;
	height: 100%;
	border-color: rgba(128, 128, 128, 0.1);
	box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	background: var(--background-1-gradient);
	color: var(--gold-1);
	line-height: 1.5;
	padding: .5rem 1rem;
	transition: background-color 0.3s, box-shadow 0.3s, border-color 0.3s;
}

.note-textarea:focus {
	outline: none;
	border-color: #FFFFFF;
	background-color: rgba(255, 255, 255, 1);
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.note-textarea::placeholder {
	color: #A9A9A9;
	font-style: italic;
}

.note-textarea:hover {
	background-color: rgba(255, 255, 255, 1);
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
	justify-content: center;
	align-items: center;
	flex-grow: 1;
	flex-direction: column;
	border-top: 2px solid var(--blue-laser-gradient);
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
	text-transform: uppercase;
	font-weight: 600;
	text-align: start;
	font-size: 1.1rem;
	padding: .5rem 1rem;
	display: flex;
	color: var(--gold-2);
}
</style>