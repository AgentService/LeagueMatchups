<template>
	<div class="summoner-display">
		<div class="position-relative icon-container">
			<img :src="summonerIcon" alt="Summoner Icon" class="rounded-circle icon-image">
			<span class="level-pill">{{ level }}</span>
		</div>
		<span class="ps-2 text-light">{{ riotIdParts.gameName }}</span>
		<span class="text-secondary">#{{ riotIdParts.tagLine }}</span>
	</div>
</template>
  
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const assetBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

const riotIdParts = computed(() => store.getters['summoner/riotIdParts']);
const profileIconId = computed(() => store.getters['summoner/profileIconId']);
const level = computed(() => store.getters['summoner/level']);

const summonerIcon = computed(() => {
	const iconId = profileIconId.value;
	if (!iconId) {
		return undefined;
	}
	return `${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${iconId}.png`;
});
</script>
  
<style scoped>
.summoner-display {
	border: none;
	padding: 10px;
	margin: 20px;
	display: inline-flex;
	align-items: center;
	cursor: pointer;
}

.icon-container {
	position: relative;
	margin-right: 12px;
}

.icon-image {
	width: 40px;
	height: 40px;
	border: 2px solid #c0c0c0;
}

.level-pill {
	position: absolute;
	bottom: -5px;
	left: 30px;
	background-color: #000000;
	color: #d3d3d3;
	padding: 2px 6px;
	border-radius: 10px;
	font-size: 0.65rem;
	font-weight: bold;
}

.summoner-display .text-light {
	color: #ffffff;
	text-shadow: 1px 1px 2px #000;
}

.summoner-display .text-secondary {
	color: #a9a9a9;
	text-shadow: 1px 1px 2px #000;
}
</style>
  