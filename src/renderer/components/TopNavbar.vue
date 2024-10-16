<template>
	<div class="main-container">
		<nav class="navbar navbar-expand-lg navbar-dark bg-dark me-4 ms-4">
			<div class="container-fluid w-75">
				<SummonerInfo></SummonerInfo>
				<div class="mx-auto d-flex justify-content-center">
					<router-link to="/ChampionPage"
						:class="['nav-link', { 'logged-out': !isLoggedIn }]">Prepare</router-link>
					<router-link to="/JournalPage"
						:class="['nav-link', { 'logged-out': !isLoggedIn }]">Journal</router-link>
					<router-link to="/userJourney"
						:class="['nav-link', { 'logged-out': !isLoggedIn }]">Test</router-link>
					<router-link to="/ReviewPage"
						:class="['nav-link', { 'logged-out': !isLoggedIn }]">Review</router-link>	

				</div>
				<div class="d-flex justify-content-center align-items-center ">
					<div class="button-container">
						<div class="dropdown" @mouseover="showTooltip = true" @mouseleave="showTooltip = false"
							style="position: relative;">
							<span class="text-light">Client</span>
							<div class="ms-2 lockfile-indicator" :class="{ 'active': clientConnected }"></div>
							<ul class="custom-tooltip dropdown-menu" v-if="showTooltip"
								:style="{ 'background': clientConnected ? '#28a745' : '#dc3545' }">
								<li class="dropdown-tooltip ">
									<a class="dropdown-item" href="#">
										<i class="fa-solid fa-circle-info me-1"></i>
										{{ clientConnected ? 'Client connected' : 'Client not connected' }}
									</a>
								</li>
							</ul>
						</div>

						<div class="button-divider"></div>
						<!-- Profile Dropdown -->
						<div class="d-flex align-items-center">
							<div class="dropdown" href="#" role="button" id="dropdownMenuLink2"
								data-bs-toggle="dropdown" aria-expanded="false">
								<div class="d-flex align-items-center">
									<span class="text-light"> {{ user?.username }}
									</span>
									<a class="btn dropdown-toggler" href="#" role="button" id="dropdownMenuLink2"
										data-bs-toggle="dropdown" aria-expanded="false">
										<!-- Show user icon if logged in, otherwise show login and registration options -->
										<font-awesome-icon :icon="['fas', 'user-circle']"
											:class="{ 'logged-out': !isLoggedIn }" /> </a>
								</div>
								<ul v-show="dropdownOpen" v-if="isLoggedIn" class="dropdown-menu"
									aria-labelledby="dropdownMenuLink2">
									<!-- <li class="dropdown-header">{{ user.username }}</li> -->
									<div class="text-light">
										<li><a class="dropdown-item text-secondary" href="#">Send Feedback</a></li>
										<li><a class="dropdown-item" href="#" @click="logout">Log Out</a></li>
										<li>
											<hr class="dropdown-divider">
										</li>
										<li><a class="dropdown-item text-secondary" href='#'
												@click="toggleVersionInfoModal">Version:
												{{
							appVersionInfo.currentVersion }} </a></li>
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
			<div v-if="showVersionInfoModal" class="version-info-modal" @click.self="showVersionInfoModal = false">
				<div>Current Version: {{ appVersionInfo.currentVersion }}</div>
				<div>Release Date: {{ appVersionInfo.releaseDate }}</div>
				<div>Release Name: {{ appVersionInfo.releaseName }}</div>
				<div>Release Notes: {{ appVersionInfo.releaseNotes }}</div>
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
import { ref, reactive } from 'vue';
import SummonerInfo from './SummonerInfo.vue';

import { computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import Debug from "debug";
const debug = Debug("app:components:TopNavbar");
const showTooltip = ref(false); // Controls the visibility of the tooltip

const clientConnected = ref(false);

const store = useStore();

const currentSummoner = computed(() => store.getters['summoner/getCurrentSummoner']);
const user = computed(() => store.state.auth.user);
const showVersionInfoModal = ref(false);
const toggleVersionInfoModal = () => {
	showVersionInfoModal.value = !showVersionInfoModal.value;
};
const appVersionInfo = reactive({
	currentVersion: '',
	available: '',
	releaseDate: '',
	releaseName: '',
	releaseNotes: '',
});

window.api.receive('current-release', (release) => {
	debug('Current release:', release);
	appVersionInfo.currentVersion = release.version;
	appVersionInfo.releaseDate = release.releaseDate;
	appVersionInfo.releaseName = release.releaseName;
	appVersionInfo.releaseNotes = release.releaseNotes;
});

window.api.receive('update-available', (update) => {
	debug('Current release:', update);
	appVersionInfo.currentVersion = update.version;
	appVersionInfo.releaseDate = update.releaseDate;
	appVersionInfo.releaseName = update.releaseName;
	appVersionInfo.releaseNotes = update.releaseNotes;
});

const isLoggedIn = computed(() => {
	console.log('Checking isLoggedIn state:', store.state.auth.isLoggedIn);
	return store.state.auth.isLoggedIn;
});

const dropdownOpen = ref(true);

// Assuming you're within an async function for direct await usage
async function getClientStatus() {
	try {
		const status = await window.api.checkClientStatus();
		clientConnected.value = status.connected;
		console.log('Client status:', status);
	} catch (error) {
		console.error('Error checking client status:', error);
	}
}

onMounted(async () => {
	window.ws.receive('client-status', (status) => {
		clientConnected.value = status.connected;
		console.log('Client connection status:', status.connected);
		// Here, you can trigger any additional logic or UI updates based on the connection status
	});
	getClientStatus();
	// const summonerIcon = computed(() => {
	// 	const iconId = currentSummoner.value?.profileIconId;
	// 	if (!iconId) {
	// 		return undefined;
	// 	}
	// 	return `${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${iconId}.png`;
	// });
});

onUnmounted(() => {
});

const logout = () => {
	store.dispatch('auth/logout');
};

</script>

<style scoped>
.version-info-modal {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: black;
	padding: 1rem;
	border-radius: 0.5rem;
	box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
	z-index: 1000;
}

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
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background-color: red;
}

.lockfile-indicator.active {
	background-color: rgb(50, 255, 50);
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
	text-decoration: underline;
}

.router-link-active {
	border-bottom: 2px solid #04D9FF;
}

.main-container {
	color: #f8f9fa;
	border-radius: 0.5rem;
	box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
	user-select: none;
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
	font-size: 0.75rem;
	align-self: flex-end;
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
