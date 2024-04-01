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
					<div class="row align-items-start">
						<!-- <div class="col-xxl-2 col-xl-2 mt-4">
							<div class="card-fluid mb-4">
								<ChampionTips :champion="championA" />
							</div>
							<div class="card-fluid mt-4">
								Placeholder
							</div>
						</div> -->
						<div class="col-xxl-8 col-xl-8">
							<div class="row align-items-start justify-content-start">
								<!-- <SummonerInfo /> -->
								<!-- <div class="d-flex">
									<div class="tab-header d-flex flex-column justify-content-center align-items-center">
										<span>Champion & Matchup</span>
										<div class="active-border"></div>
									</div>
								</div> -->

							</div>
							<div class="row mb-4 mt-4">


								<div class="col-xxl-12">
									<div class="card-container flex-row">

										<!-- Champion Search for User's Champion -->
										<!-- <div class="col-xxl-2 col-xl-2">
										<div class="card">
											<SummonerRankedInfo />
										</div>
										<div class="card">
										</div>
									</div> -->
										<div class="col-xxl-6 position-relative">
											<div class="card-large">
												<ChampionSearch :instanceId="1" @championSelected="setChampionA" />
												<ChampionNotes />
											</div>
										</div>
										<!-- VS Divider -->
										<div class="vs-container">
											<!-- <span>vs</span> -->
										</div>
										<!-- Matchup Notes and Search for Enemy Champion -->
										<div class="col-xxl-6 position-relative">
											<div class="card-large">
												<ChampionSearch :instanceId="2" @championSelected="setChampionB" />
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
							</div>
							<div class="row">
								<div class="col-xxl-12">
									<div class="card-wide">
										<GeneralNotes />
									</div>
								</div>
								<!-- <div class="col-xxl-9">
									<div class="card-large card-top card-bottom">
										 <MatchHistory /> 
									</div>
								</div> -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>



<script setup>
import { ref, watch, onMounted, computed } from 'vue';
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
import { on } from 'events';


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
	// store.dispatch('champions/fetchChampionTips', { championId: champion.id });
	// store.dispatch('notes/fetchChampionPersonalNotes', champion.id);

};

const setChampionB = (champion) => {
	championB.value = champion;
	store.dispatch('matchups/setChampionB', champion);
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
	font-size: 3rem;
	top: 12%;
	right: 49%;
	width: 10px !important;
	height: 40px;
	padding: 1rem;
	color: #fff;
	text-shadow: 0 0 5px #00ffeacd,
		0 0 10px #00ffeac2,
		0 0 20px #00ffeac3;
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
	background: var(--card-background);
	border: 1px solid rgba(128, 128, 128, 0.1);
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
	padding: 1rem 2rem;
	max-height: 670px;
	min-height: 670px;
	z-index: 1;
}

.card-wide {
	user-select: none;
	position: relative;
	display: flex;
	flex-direction: column;
	color: var(--gold-1);
	padding: 1rem 2rem;
	max-height: 670px;
	min-height: 670px;
	background-image: linear-gradient(to right, #091014, #091014);
	z-index: 1;
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
	font-size: 1rem;
	padding: 1rem .5rem;
	padding-bottom: 0.5rem;
	margin-bottom: 0.5rem;
	display: flex;
	color: var(--gold-4);
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