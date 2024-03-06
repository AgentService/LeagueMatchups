<template>
	<div class="main-container">

		<nav class="navbar navbar-expand-lg navbar-dark bg-dark me-4 ms-4">
			<div class="container-fluid w-75">
				<div class="d-flex justify-content-start">
					<SummonerInfo></SummonerInfo>
				</div>
				<div class="mx-auto d-flex justify-content-center">
					<router-link to="/championMatchup"
						:class="['nav-link', { 'logged-out': !isLoggedIn }]">Prepare</router-link>
					<router-link to="/userJourney"
						:class="['nav-link', { 'logged-out': !isLoggedIn }]">Journey</router-link>
				</div>
				<div class="d-flex justify-content-center align-items-center ">
					<div class="button-container">
						<div class="dropdown" @mouseover="showTooltip = true" @mouseleave="showTooltip = false"
							style="position: relative;">
							<a class="btn dropdown-toggler" href="#" role="button">
								<span>Client</span>
								<div class="ms-2 lockfile-indicator" :class="{ 'active': lockfileConnected }"></div>
							</a>
							<ul class="custom-tooltip dropdown-menu" v-if="showTooltip"
								:style="{ 'background': lockfileConnected ? '#28a745' : '#dc3545' }">
								<li class="dropdown-tooltip ">
									<a class="dropdown-item" href="#">
										<i class="fa-solid fa-circle-info me-1"></i>
										{{ lockfileConnected ? 'Client connected' : 'Client not connected' }}
									</a>
								</li>
							</ul>
						</div>

						<div class="button-divider"></div>
						<!-- Profile Dropdown -->
						<div>
							<div class="dropdown">
								<a class="btn dropdown-toggler" href="#" role="button" id="dropdownMenuLink2"
									data-bs-toggle="dropdown" aria-expanded="false">
									<!-- Show user icon if logged in, otherwise show login and registration options -->
									<font-awesome-icon :icon="['fas', 'user-circle']"
										:class="{ 'logged-out': !isLoggedIn }" /> </a>
								<ul v-show="dropdownOpen" v-if="isLoggedIn" class="dropdown-menu"
									aria-labelledby="dropdownMenuLink2">
									<li class="dropdown-header">{{ user.username }}</li>
									<li>
										<hr class="dropdown-divider">
									</li>
									<div class="text-secondary">
										<li><a class="dropdown-item" href="#">Send Feedback</a></li>
										<li><a class="dropdown-item" href="#" @click="logout">Log Out</a></li>
									</div>
								</ul>
							</div>
							<!-- <span v-else class="auth-buttons">
								<Login />
								<RegistrationForm />
							</span> -->
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

import { computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";

const showTooltip = ref(false); // Controls the visibility of the tooltip

const lockfileConnected = ref(false);

const store = useStore();
const assetBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

const currentSummoner = computed(() => store.getters['summoner/getCurrentSummoner']);
const user = computed(() => store.state.auth.user);
const isLoggedIn = computed(() => {
	console.log('Checking isLoggedIn state:', store.state.auth.isLoggedIn);
	return store.state.auth.isLoggedIn;
});

const dropdownOpen = ref(true);

async function checkLockfileConnection() {
	try {
		const isConnected = await window.api.checkLockfileExists();
		const clientStatus = await window.api.checkClientStatus();

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
	const intervalId = setInterval(checkLockfileConnection, 5000); // Check every 5 seconds

	onUnmounted(() => {
		clearInterval(intervalId); // Clear the interval when the component is unmounted
	});

	const summonerIcon = computed(() => {
		const iconId = currentSummoner.value?.profileIconId;
		if (!iconId) {
			return undefined;
		}
		return `${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${iconId}.png`;
	});
});

const logout = () => {
	store.dispatch('auth/logout');
	router.push('/login'); // Redirect to the login page after logout
};

</script>

<style scoped>
.dropdown-toggler {
	display: flex;
	align-items: center;
	cursor: pointer;
	flex-direction: row;
}

.custom-tooltip .dropdown-item {
	cursor: default;
}

.button-container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-around;
}

.button-divider {
	width: 1px;
	height: 20px;
	background-color: var(--grey-3);
	margin: auto 20px;
	align-self: stretch;
	flex: 0 0 1px;
}

.custom-tooltip {
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translate(25%, 11px);
	z-index: 1050;
	width: auto;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	border: 1px solid var(--grey-2);
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

.nav-link {
	color: #fff;
	text-decoration: none;
	padding: 10px 15px;
	transition: color 0.3s ease;
}

.logged-out {
	color: var(--grey-3);
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
	max-height: 50px;
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
