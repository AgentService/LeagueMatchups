<template>
	<!-- <div v-if="isUpdateAvailable" class="popup"> -->
	<!-- <div class="popup">
		An update is available! <button @click="checkForUpdates">Download</button>
		<button @click="closeUpdateAvailablePopup">Close</button>
	</div> -->
	<Navbar @before-leave="handleBeforeLeave">
	</Navbar>
	<div class="app-wrapper">
		<router-view v-slot="{ Component }">
			<transition name="fade">
				<component :is="Component" />
			</transition>
		</router-view>
	</div>
	<Update />
</template>

<script setup>
import Update from './components/Update.vue';
import { useRoute } from 'vue-router';
import { onMounted, onUnmounted, ref, reactive } from 'vue';
import Navbar from './components/TopNavbar.vue';
import { store } from '../store';
import Debug from 'debug';
const debug = Debug('app:components:App');

const route = useRoute();
const showNavbar = ref(route.path !== '/login');

function handleBeforeLeave() {
	showNavbar.value = false; // Hide Navbar, show placeholder
	setTimeout(() => {
		showNavbar.value = true; // Revert after transition duration
	}, 1100); // Match your fade transition duration
}

onMounted(async () => {
	store.dispatch('init/checkAndUpdateVersion'); // Adjust based on whether the action is global or namespaced
});

</script>

<style scoped></style>
