<template>
	<Navbar @before-leave="handleBeforeLeave">
	</Navbar>
	<div class="app-wrapper">
		<transition name="fade">
			<router-view></router-view>
		</transition>
	</div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import Navbar from './components/TopNavbar.vue';

// import CustomPopup from './components/utility/LockfilePopup.vue';
const route = useRoute();
const showNavbar = ref(route.path !== '/login');

function handleBeforeLeave() {
	showNavbar.value = false; // Hide Navbar, show placeholder
	setTimeout(() => {
		showNavbar.value = true; // Revert after transition duration
	}, 1100); // Match your fade transition duration
}

function checkForUpdates() {
	window.api.checkForUpdates();
}

function restartApp() {
	window.api.restartApp();
}


onMounted(() => {
	debugger
	window.api.onUpdateAvailable(() => {
		console.log('Update available. It will be downloaded automatically.');
		// Update UI accordingly
	});

	window.api.onUpdateDownloaded(() => {
		console.log('Update downloaded. Restart to apply the update.');
		// Prompt user to restart the app
	});
	// store.dispatch('utilities/checkAndUpdateVersion'); // Adjust based on whether the action is global or namespaced
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
