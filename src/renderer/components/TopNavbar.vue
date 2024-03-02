<template>
	<div class="main-container">

		<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
			<div class="container-fluid w-75">
				<div class="d-flex justify-content-start">
					<SummonerInfo></SummonerInfo>
				</div>
				<div class="mx-auto d-flex justify-content-center">
					<router-link to="/championMatchup" class="nav-link">Prepare</router-link>
					<router-link to="/userJourney" class="nav-link">Journey</router-link>
				</div>
				<div class="d-flex justify-content-center align-items-center">
					<div class="button-container d-flex align-items-center">
						<!-- Tooltip Container -->
						<div class="tooltip-container me-3">
							<a class="btn" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown"
								aria-expanded="false" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">
								<span>Game events</span>
								<div class="ms-2 lockfile-indicator" :class="{ 'active': lockfileConnected }"></div>
							</a>
							<div class="custom-tooltip" v-if="showTooltip">
								<div class="dropdown-item d-flex align-items-center">
									<div class="me-2 lockfile-indicator" :class="{ 'active': lockfileConnected }"></div>

									{{ lockfileConnected ? 'Client connected' : 'Client not connected' }}
								</div>
							</div>
						</div>

						<!-- Vertical Separator -->

						<!-- Profile Dropdown -->
						<div class="dropdown">
							<a class="btn dropdown-toggler" href="#" role="button" id="dropdownMenuLink2"
								data-bs-toggle="dropdown" aria-expanded="false">
								<i class="fas fa-user-circle"></i> <!-- Font Awesome User Icon -->
							</a>
							<ul class="dropdown-menu" aria-labelledby="dropdownMenuLink2">
								<li><a class="dropdown-item" href="#">User Email</a></li>
								<li><a class="dropdown-item" href="#">User Settings</a></li>
								<li>
									<hr class="dropdown-divider">
								</li>
								<li>
									<Login></Login>
								</li>
								<li>
									<RegistrationForm></RegistrationForm>
								</li>
								<li><a class="dropdown-item" href="#">Logout</a></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<!-- <div class="container-fluid justify-content-start justify-content-right" style="max-width: 1280px;">
				<div class="d-flex position-relative">
					<div v-if="!summonerIcon" class="spinner-grow text-light" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
					<div v-else class="dropdown">
						<button class="btn btn-dark dropdown-toggle" type="button" id="dropdownSummonerButton"
							data-bs-toggle="dropdown" aria-expanded="false">
							<div class="position-relative">
								<div class="position-relative icon-container">
									<img :src="summonerIcon" alt="Summoner Icon" class="rounded-circle icon-image">
									<span class="level-pill">{{ currentSummoner?.summonerLevel }}</span>
								</div>
								<span class="ps-2 text-light">{{ currentSummoner?.gameName }}</span>
								<span class="text-secondary">#{{ currentSummoner?.tagLine }}</span>
							</div>
						</button>
						<div class="dropdown-menu animate-slide-in" aria-labelledby="dropdownSummonerButton">
							<div class="dropdown-header">Ranked Solo</div>
							<div class="dropdown-item">
								<div class="d-flex justify-content-between align-items-center">
									<div class="text-end flex-grow-1">
										<div class="d-flex justify-content-between align-items-center">
											<span class="rank-text ms-0 mb-2">Platin 1</span>
											<span class="lp-text  me-1 mb-2"><small>{{ lpPercentage }}
													LP</small></span>

										</div>
										<ProgressBar :value="lpPercentage"></ProgressBar>
										<div class="d-flex justify-content-between">

											<span class="win-rate-text ms-0 mt-2"><small>39.3% Win
													Rate</small></span>
											<span class="win-loss-text  me-1 mt-2"><small>11S - 17N</small></span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<a class="navbar-brand me-auto ms-auto" href="#"></a>
			</div> -->
		</nav>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import Login from "./LoginForm.vue";
import RegistrationForm from "./RegistrationForm.vue";
import SummonerInfo from './SummonerInfo.vue';

import { computed, onMounted } from "vue";
import { useStore } from "vuex";

const showTooltip = ref(false); // Controls the visibility of the tooltip

const lockfileConnected = ref(false);

const store = useStore();
const assetBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

const currentSummoner = computed(() => store.getters['summoner/getCurrentSummoner']);

async function checkLockfileConnection() {
	try {
		const isConnected = await window.api.checkLockfileExists();
		lockfileConnected.value = isConnected;
	} catch (error) {
		console.error("Error checking lockfile connection:", error);
		lockfileConnected.value = false;
	}
}

window.api.receive("directory-path-selected", async (data) => {
	const { directoryPath, lockfilePath } = data;
	if (lockfilePath) {
		await checkLockfileConnection(); // Update the lockfile connection indicator
	}
});

onMounted(async () => {
	checkLockfileConnection();
	// await store.dispatch("summoner/getSummonerData");
});

const summonerIcon = computed(() => {
	const iconId = currentSummoner.value?.profileIconId;
	if (!iconId) {
		return undefined;
	}
	return `${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${iconId}.png`;
});
</script>

<style scoped>
.dropdown-toggler {
	border: none;
	background: none;
	color: #fff;
	font-size: 1.2rem;
}

.dropdown {
	position: relative;
}

.dropdown .dropdown-toggle {
	border: none;
}

.tooltip-container {
	position: relative;
	display: inline-block;
}

.tooltip-container .btn {
	border: none;
	background: none;
	font-size: .8rem;
}

.lockfile-indicator {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background-color: red;
}

.lockfile-indicator.active {
	background-color: rgb(50, 255, 50);
	border-radius: 50%;
	display: inline-block;
}

/*
	Tooltip styling
*/

.custom-tooltip {
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	background-color: #000;
	color: #fff;
	text-align: center;
	border-radius: 5px;
	padding: 5px;
	border: 1px solid  var(--grey-2);
	z-index: 1000;
	margin-top: 10px;
}

.custom-tooltip::before {
	content: '';
	position: absolute;
	bottom: 120%;
	left: 50%;
	border-width: 10px;
	border-style: solid;
	border-color: transparent transparent #000 transparent;
	transform: translateX(-50%) translateY(1px);
	/* Adjust for border */
	z-index: -1;
}

.custom-tooltip::after {
	content: '';
	position: absolute;
	bottom: 120%;
	left: 50%;
	transform: translateX(-50%) translateY(2px);
	/* Adjust for border */
	border-width: 9px;
	border-style: solid;
	border-color: transparent transparent var(--grey-2) transparent;
	/* White arrow to match border */
	margin-bottom: -9px;
	/* Adjusts the position of the arrow to overlap the tooltip */
}

.dropdown-menu.show {
	display: block;
	/* Override Bootstrap's default hiding */
}

.nav-link {
	color: #fff;
	text-decoration: none;
	padding: 10px 15px;
	transition: color 0.3s ease;
}

.nav-link:hover {
	color: #04D9FF;
	/* Highlight color on hover */
	text-decoration: underline;
}

.router-link-active {
	border-bottom: 2px solid #04D9FF;
}

/* Main container style */
.main-container {
	color: #f8f9fa;
	border-radius: 0.5rem;
	box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

}

.main-container>* {
	background: linear-gradient(145deg, #1b2735 0%, #090a0f 100%);
	color: #c7d3dc;
}

.main-container h1,
.main-container p {
	color: #f8f9fa;
}

.main-container .btn {
	color: var(--gold-1);
}

.navbar {
	font-size: 0.85rem;
	background: var(--navbar-background-gradient);
	max-height: -50%0px;
	margin: 0 auto;
}

.navbar-brand {
	color: #fff;
}

.rank-text {
	font-weight: bold;
}

.win-rate-text {
	font-size: 0.75rem;
	align-self: flex-start;
}

.win-loss-text {
	/* ... other styles ... */
	font-size: 0.75rem;
	/* Smaller font for win/loss record */
	align-self: flex-end;
	/* Aligns win/loss to the right */
}

.rank-image {
	width: 90px;
	height: auto;
	margin-right: 1rem;
	box-sizing: border-box;
}

.animate-slide-in {
	animation: slideIn 0.3s ease-out;
}

/* Container for the image and the level pill */
.icon-container {
	position: relative;
	display: inline-block;
	text-align: center;
}

.icon-image {
	width: 30px;
	height: 30px;
}

.lp-text {

	position: relative;
	color: #fff;
	background: transparent;
	z-index: 2;

}

.level-pill {
	position: absolute;
	bottom: -10px;
	left: 50%;
	transform: translateX(-50%);
	font-size: 10px;
	color: #fff;
	padding: 0.25em 0.5em;
	border-radius: 10px;
	background: var(--navbar-background-elements);
}


/* Dropdown styling */
@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

.animate-slide-in {
	animation: fadeIn 0.5s ease forwards;
}

.dropdown-menu {
	background: var(--navbar-background-elements);
	color: #f8f9fa;
	border: none;
	padding: .5rem;
	box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
	margin-top: 0.25rem;
	box-shadow: 0 4px 8px rgba(0, 0, 0, .5);
}

/* Dropdown item styling */
.dropdown-item {
	padding: 0.75rem;
	background: none;
}

.dropdown-item .flex-grow-1 {
	display: flex;
	flex-direction: column;
}

.dropdown-item,
.dropdown-header {
	font-size: .875rem;
	color: inherit;
	text-align: center;
}

.dropdown-item:hover,
.dropdown-item:focus {
	background-color: transparent;
	color: inherit;
}


/* Custom progress bar to match the theme */
.progress {
	height: .5rem;
	background-color: #0e0e10;
	border-radius: 1rem;
	align-self: flex-start;
	width: 100%;
}


/* The rank and LP text styling */
.ranked-text {
	color: #a9a9a9;
	align-self: flex-start;
	font-size: 0.9rem;
}</style>
