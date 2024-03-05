<template>
	<Navbar v-if="route.path !== '/login'">
		<!-- Navigation links -->
	</Navbar>
	<div class="app-wrapper">
		<router-view></router-view>
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

import CustomPopup from './components/utility/LockfilePopup.vue';
const route = useRoute();

const showPopup = ref(false);

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

<style></style>
