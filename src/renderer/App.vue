<template>
	<!-- <div v-if="isUpdateAvailable" class="popup"> -->
	<!-- <div class="popup">
		An update is available! <button @click="checkForUpdates">Download</button>
		<button @click="closeUpdateAvailablePopup">Close</button>
	</div> -->
	<Navbar @before-leave="handleBeforeLeave">
	</Navbar>
	<div class="app-wrapper">
		<transition name="fade">
			<router-view></router-view>
		</transition>
	</div>
	<transition name="fade">
		<div v-if="updateState.show || updateError" class="update-popup">
			<!-- Header Section -->
			<div class="popup-header">
				<p>Update</p>
			</div>

			<!-- Content Section -->
			<div class="popup-content">
				<p v-if="updateState.message" key="message">{{ updateState.message }}</p>
				<p v-if="updateError" key="error" class="error-message">Error updating: {{ updateError }}</p>
			</div>

			<div class="popup-actions">
				<div v-if="updateState.progress > 0 && !updateState.showRestartButton" class="update-progress"
					key="progress">
					<div class="update-progress-bar" :style="{ width: `${updateState.progress}%` }"></div>
				</div>
				<button class="button" v-if="updateState.message === 'An update is available!' && !updateState.progress"
					@click="startDownload" key="download">
					Download
				</button>

			</div>

			<!-- Action Section -->
			<div class="popup-actions">
				<button class="button-primary" v-if="updateState.showRestartButton" @click="restartAppToUpdate"
					key="restart">
					Restart
				</button>
				<button class="button-secondary" v-if="updateState.show" @click="postponeUpdate" key="postpone">
					Later
				</button>
				<button class="button-secondary"
					v-if="updateState.message === 'An update is available!' && !updateState.progress"
					@click="startDownload" key="download">
					Download
				</button>
			</div>
		</div>
	</transition>
</template>

<script setup>

import { useRoute } from 'vue-router';
import { onMounted, onUnmounted, ref, reactive } from 'vue';
import Navbar from './components/TopNavbar.vue';

const updateDownloaded = ref(false);
const updateError = ref(null);
const updateState = reactive({
	message: '',
	progress: 0,
	show: false,
	showRestartButton: false,
});

// import CustomPopup from './components/utility/LockfilePopup.vue';
const route = useRoute();
const showNavbar = ref(route.path !== '/login');

function handleBeforeLeave() {
	showNavbar.value = false; // Hide Navbar, show placeholder
	setTimeout(() => {
		showNavbar.value = true; // Revert after transition duration
	}, 1100); // Match your fade transition duration
}

function restartAppToUpdate() {
	// checkForUpdates();
	// updateState.showRestartButton = false;
	// updateState.progress = 0;
	// updateState.show = true;
	// updateDownloaded.value = false;
	window.api.restartAppToUpdate(); // Triggers the app restart and update installation in the main process
}

function postponeUpdate() {
	updateState.show = false;
}


function startDownload() {
	updateState.progress = 0;
	updateState.show = true;
	window.api.startDownload(); // Triggers the download in the main process
}

function checkForUpdates() {
	window.api.checkForUpdates();
}

const handleUpdateAvailable = (update) => {
	updateState.message = 'An update is available!';
	console.log('Update available:', update);
	updateState.show = true;
	startDownload(); // Automatically start download or wait for user action
};

const handleUpdateDownloaded = () => {
	console.log('Update downloaded');
	updateDownloaded.value = true;
	updateState.message = 'Update ready. Restart the app to install.';
	updateState.showRestartButton = true;
	updateState.show = true;
};

const handleDownloadProgress = (progress) => {
	console.log("Download progress:", progress.percent); // Debugging
	updateState.progress = progress.percent;
	updateState.message = `Downloading update: ${progress.percent}%`;
	updateState.show = true;
};

const handleUpdateError = (error) => {
	console.log('Update error:', error);
	updateError.value = error;
	updateState.message = `Error updating: ${error}`;
	updateState.show = true;
};

onMounted(() => {
	checkForUpdates(); // Check for updates when the component mounts
	const unsubscribeUpdateAvailable = window.api.receive('update-available', handleUpdateAvailable);
	const unsubscribeUpdateDownloaded = window.api.receive('update-downloaded', handleUpdateDownloaded);
	const unsubscribeDownloadProgress = window.api.receive('download-progress', handleDownloadProgress);
	const unsubscribeUpdateError = window.api.receive('update-error', handleUpdateError);

	if (import.meta.hot) {
		import.meta.hot.dispose(() => {
			unsubscribeUpdateAvailable();
			unsubscribeUpdateDownloaded();
			unsubscribeDownloadProgress();
			unsubscribeUpdateError();
		});
	}
	store.dispatch('utilities/checkAndUpdateVersion'); // Adjust based on whether the action is global or namespaced
});

onUnmounted(() => {
	window.api.removeReceive('update-available', handleUpdateAvailable);
	window.api.removeReceive('update-downloaded', handleUpdateDownloaded);
	window.api.removeReceive('download-progress', handleDownloadProgress);
	window.api.removeReceive('update-error', handleUpdateError);
});
</script>

<style scoped>
.update-popup {
	position: fixed;
	bottom: 20px;
	right: 20px;
	background: var(--dialog-background);
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 8px 12px rgba(0, 0, 0, 0.5);
	width: 300px;
	height: 250px;
	display: flex;
	color: var(--blue-7);
	flex-direction: column;
}

.popup-header {
	font-weight: 700;
	font-size: 1.5rem;
}

.popup-content {
	flex-grow: 1;
}

.popup-actions {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.update-progress {
	width: 100%;
	background-color: var(--blue-7);
	border-radius: 0.25rem;
	margin-bottom: 1rem;
}

.update-progress-bar {
	height: 1rem;
	background-color: #007bff;
	transition: width 0.6s ease;
}

.error-message {
	color: #d9534f;
}



</style>
