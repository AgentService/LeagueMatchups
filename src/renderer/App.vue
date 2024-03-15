<template>
	<!-- <div v-if="isUpdateAvailable" class="popup"> -->
	<div class="popup">
		asdasdsdAn update is available!1.w0.4 <button @click="checkForUpdates">Download</button>
		<button @click="closeUpdateAvailablePopup">Close</button>
	</div>
	<Navbar @before-leave="handleBeforeLeave">
	</Navbar>
	<div class="app-wrapper">
		<transition name="fade">
			<router-view></router-view>
		</transition>
	</div>
	<div v-if="isUpdateAvailable" class="popup">
		An update is avaasdilable!555 <button @click="checkForUpdates">Downsdload</button>
	</div>

	<div v-if="updateDownloaded" class="popup">
		Update downlasdoaded. <button @click="restartAppToUpdate">Restart to isdnstall</button>
	</div>

	<div v-if="downloadProgress > 0" class="popup">
		Downloadasding update: {{ downloadProgress }}%
	</div>

	<div v-if="updateError" class="popup">
		Error updating: {{ updateError }}
	</div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import Navbar from './components/TopNavbar.vue';

const isUpdateAvailable = ref(false);
const updateDownloaded = ref(false);
const downloadProgress = ref(0);
const updateError = ref(null);

// import CustomPopup from './components/utility/LockfilePopup.vue';
const route = useRoute();
const showNavbar = ref(route.path !== '/login');

function handleBeforeLeave() {
	showNavbar.value = false; // Hide Navbar, show placeholder
	setTimeout(() => {
		showNavbar.value = true; // Revert after transition duration
	}, 1100); // Match your fade transition duration
}

function closeUpdateAvailablePopup() {
	isUpdateAvailable.value = false;
}

function checkForUpdates() {
	window.api.checkForUpdates();
}

function restartAppToUpdate() {
	window.api.restartAppToUpdate();
}

onMounted(() => {
	window.api.onUpdateAvailable(() => {
		console.log('update available');
		isUpdateAvailable.value = true;
	});

	window.api.onUpdateDownloaded(() => {
		console.log('update downloaded');
		updateDownloaded.value = true;
	});

	window.api.onDownloadProgress((progress) => {
		console.log('download progress', progress);
		downloadProgress.value = progress;
	});

	window.api.onUpdateError((error) => {
		console.log('update error', error);
		updateError.value = error;
	});
});
// store.dispatch('utilities/checkAndUpdateVersion'); // Adjust based on whether the action is global or namespaced


</script>

<style>
.popup {
	position: fixed;
	bottom: 20px;
	z-index: 100;
	right: 20px;
	background: white;
	padding: 20px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

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
