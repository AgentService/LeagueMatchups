<template>
	<Navbar>
		<!-- Navigation links -->
	</Navbar>
	<div class="app-wrapper">
		<router-view></router-view>
	</div>
</template>
  
<script setup>
import { onMounted } from 'vue';
import Navbar from './components/TopNavbar.vue';


onMounted(() => {
	// store.dispatch('utilities/checkAndUpdateVersion'); // Adjust based on whether the action is global or namespaced
	// store.dispatch("champions/retrieveChampionData");
});
</script>
  
<style>
/* Global styles */
</style>
