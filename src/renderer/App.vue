<template>
	<Navbar @before-leave="handleBeforeLeave">
	</Navbar>
	<div class="app-wrapper">
			<router-view>
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
	showNavbar.value = false;
	setTimeout(() => {
		showNavbar.value = true;
	}, 1100);
}

onMounted(async () => {
	store.dispatch('init/checkAndUpdateVersion');
});

</script>

<style scoped></style>
