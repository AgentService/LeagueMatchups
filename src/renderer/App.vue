<template>
	<transition name="fade">
		<Navbar @before-leave="handleBeforeLeave">
		</Navbar>
	</transition>
	<div class="app-wrapper">
		<transition name="fade">
			<router-view></router-view>
		</transition>
		<div>
			<!-- Conditionally render the custom popup -->
			<!-- <CustomPopup v-if="showPopup" @close="showPopup = false" /> -->
		</div>
	</div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import Navbar from './components/TopNavbar.vue';

// import CustomPopup from './components/utility/LockfilePopup.vue';
const route = useRoute();
const showNavbar = ref(route.path !== '/login');

const showPopup = ref(false);

function handleBeforeLeave() {
	showNavbar.value = false; // Hide Navbar, show placeholder
	setTimeout(() => {
		showNavbar.value = true; // Revert after transition duration
	}, 1100); // Match your fade transition duration
}

// Example function that checks for the lockfile
async function checkLeagueClientDirectory() {
	// Simulate checking for the lockfile, e.g., by sending an IPC message to Electron's main process
	const leagueClientPath = await window.api.checkLeagueClientPathExists();

	if (!leagueClientPath) {
		showPopup.value = true; // Show the popup if the LeagueClient.exe path is not found
	}
}

onMounted(() => {
	// store.dispatch('utilities/checkAndUpdateVersion'); // Adjust based on whether the action is global or namespaced
	checkLeagueClientDirectory();
});

</script>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
	transition-delay: 0.5s;
	/* Delay the disappearance to allow for a smooth transition */
}
</style>
