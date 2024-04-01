<template>
    <transition name="fade">
        <div v-if="updateState.show || updateError" class="update-popup">
            <!-- Header Section -->
            <div class="popup-header">
                <p>Update</p>
            </div>

            <!-- Content Section -->
            <div class="popup-content">
                <p v-if="updateState.message">{{ updateState.message }}</p>
                <p v-if="updateError" class="error-message">Error updating: {{ updateError }}</p>
                <!-- <p v-if="appVersionInfo.available && updateState.showRestartButton">New Version: {{ appVersionInfo.available }}</p> -->
            </div>

            <!-- Progress and Actions Section -->
            <div class="popup-actions">
                <div v-if="updateState.progress > 0 && !updateState.showRestartButton" class="update-progress">
                    <div class="update-progress-bar" :style="{ width: `${updateState.progress}%` }"></div>
                </div>
                <button class="button-primary" v-if="updateState.showRestartButton" @click="restartAppToUpdate">
                    Restart
                </button>
                <button class="button-secondary" v-if="updateState.showRestartButton" @click="postponeUpdate">
                    Later
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import Debug from 'debug';
const debug = Debug('app:components:App');
const store = useStore();

const updateDownloaded = ref(false);
const updateError = ref(null);
const updateState = reactive({
    message: '',
    progress: 0,
    show: false,
    showRestartButton: false,
});


const appVersionInfo = reactive({
    available: null,
});

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


// function startDownload() {
// 	updateState.progress = 0;
// 	updateState.show = true;
// 	window.api.startDownload(); // Triggers the download in the main process
// }

function checkForUpdates() {
    window.api.checkForUpdates();
}

const handleUpdateAvailable = (update) => {
    updateState.message = 'An update is available!';
    debug('Update available:', update);
    appVersionInfo.available = update.version;
    updateState.show = true;
    // startDownload(); // Automatically start download or wait for user action
};

const handleUpdateDownloaded = (update) => {
    debug('Update downloaded:');
    appVersionInfo.available = update.version;
    updateDownloaded.value = true;
    updateState.message = 'Restart the app to install.';
    updateState.showRestartButton = true;
    updateState.show = true;
};


const handleDownloadProgress = (progress) => {
    const roundedProgress = Math.round(progress.percent);
    debug("Download progress:", roundedProgress);
    updateState.progress = roundedProgress;
    updateState.message = `Downloading: ${roundedProgress}%`;
    updateState.show = true;
};


const handleUpdateError = (error) => {
    debug('Update error:', error);
    updateError.value = error;
    updateState.message = `Error updating: ${error}`;
    updateState.show = true;
};

onMounted(async () => {
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
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.5);
    width: 250px;
    height: 180px;
    display: flex;
    color: var(--blue-7);
    flex-direction: column;
}

.popup-header {
    font-weight: 700;
    font-size: 1.25rem;
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
    width: 90%;
    background-color: var(--blue-7);
    border-radius: 0.25rem;
    margin-bottom: .5rem;
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