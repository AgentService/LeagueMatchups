<template>
	<div class="main-container">

		<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
			<div class="container-fluid">
				<div class="d-flex justify-content-start">
					<Login></Login>
					<RegistrationForm></RegistrationForm> <!-- Add the registration form component here -->

				</div>
				<div class="mx-auto d-flex justify-content-center">
					<router-link to="/championMatchup" class="nav-link">Prepare</router-link>
					<router-link to="/userJourney" class="nav-link">Journey</router-link>
				</div>
				<div class="d-flex justify-content-end">
					<div class="container-fluid justify-content-start justify-content-right" style="max-width: 1480px;">
						<div class="d-flex position-relative">
							<!-- Loading spinner or dropdown based on summonerIcon's state -->
							<div v-if="!summonerIcon" class="spinner-grow text-light" role="status">
								<span class="visually-hidden">Loading...</span>
							</div>
							<!-- Dropdown -->
							<div v-else class="dropdown">
								<button class="btn btn-dark dropdown-toggle" type="button" id="dropdownSummonerButton"
									data-bs-toggle="dropdown" aria-expanded="false">
									<div class="position-relative">
										<div class="position-relative icon-container">
											<img :src="summonerIcon" alt="Summoner Icon" class="rounded-circle icon-image">
											<span class="level-pill">{{ level }}</span>
										</div>
										<span class="ps-2 text-light">{{ riotIdParts.gameName }}</span>
										<span class="text-secondary">#{{ riotIdParts.tagLine }}</span>
									</div>
								</button>
								<!-- Dropdown Menu -->
								<div class="dropdown-menu animate-slide-in" aria-labelledby="dropdownSummonerButton">
									<div class="dropdown-header">Ranked Solo</div>
									<div class="dropdown-item">
										<div class="d-flex justify-content-between align-items-center">
											<!-- Rank image on the left -->
											<!-- <img src="/img/tier-icons/tier-icons-base/platinum.png" alt="Rank Image"
												class="rank-image"> -->
											<!-- Rank text on the right, above the progress bar -->
											<div class="text-end flex-grow-1">
												<div class="d-flex justify-content-between align-items-center">
													<span class="rank-text ms-0 mb-2">Platin 1</span>
													<span class="lp-text  me-1 mb-2"><small>{{ lpPercentage }}
															LP</small></span>

												</div>

												<!-- Progress Bar Component -->
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
					</div>
				</div>
			</div>
		</nav>
	</div>
</template>

<script setup>
import Login from "./LoginForm.vue";
import RegistrationForm from './RegistrationForm.vue'; // Import the registration form component

import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import ProgressBar from "./utility/ProgressBar.vue";

const store = useStore();
const assetBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

// const accountData = computed(() => store.getters["summoner/accountData"]);
// const summonerData = computed(() => store.getters["summoner/summonerData"]);
const riotIdParts = computed(() => store.getters["summoner/riotIdParts"]);
const profileIconId = computed(() => store.getters["summoner/profileIconId"]);
const level = computed(() => store.getters["summoner/level"]);
const lpPercentage = computed(() => 79); // Assuming 79 LP for demonstration

onMounted(async () => {
	await store.dispatch("summoner/getSummonerData");
});

const summonerIcon = computed(() => {
	const iconId = profileIconId.value;
	if (!iconId) {
		return undefined;
	}
	return `${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${iconId}.png`;
});
</script>

<style scoped>
.nav-link {
	color: #fff;
	/* Adjust the color to fit your theme */
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
	background: linear-gradient(145deg, #3a3a6e50, #5656b957);
	/* Subtle gradient for buttons */
	border: none;
	color: #fff;
	padding: 0px 10px;
}

.main-container .btn:hover {
	background: linear-gradient(145deg, #3a3a6e, #5656b9);
}

.navbar {
	font-size: 0.85rem;
	background: var(--navbar-background-gradient);
	max-height: 50px;
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
	background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
	color: #f8f9fa;
	border: none;
	border-radius: 0.5rem;
	box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
	width: 350px;
	margin-top: 0.5rem;
	padding: 1rem;
	border: 1px solid #3b83f61f;
	margin-top: .5rem;
	box-shadow: 0 4px 8px rgba(0, 0, 0, .5);
}

/* Dropdown item styling */
.dropdown-item {
	padding: 0.75rem;
	background: none;
	border-radius: 0.25rem;
}

.dropdown-item .flex-grow-1 {
	display: flex;
	flex-direction: column;
}

.dropdown-item,
.dropdown-header {
	font-size: 1rem;
	color: inherit;
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
}
</style>
