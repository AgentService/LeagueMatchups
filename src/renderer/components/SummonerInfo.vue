<template>
	<div class="dropdown summoner-display" @click="dropdownOpen = !dropdownOpen" :aria-expanded="dropdownOpen.toString()">
		<a class="btn dropdown-toggler" href="#" role="button" aria-expanded="false">
			<div class="d-flex align-items-center">
				<img :src="currentSelection ? getSummonerIcon(currentSelection.profileIconId) : getSummonerIcon(5541)"
					alt="Summoner Icon" class="rounded-circle icon-image me-2">
				<span class="text-light">{{ currentSelection?.gameName || 'Summoner' }}</span>
				<span class="text-secondary ms-1 tag">#{{ currentSelection?.tagLine || '' }}</span>
			</div>
		</a>
		<ul class="dropdown-menu" :class="{ 'show': dropdownOpen }">
			<li class="dropdown-header">Summoner</li>
			<li>
				<hr class="dropdown-divider">
			</li>
			<li v-for="detail in allPlayerDetails" :key="detail.puuid" @click="selectSummoner(detail)">
				<a class="dropdown-item d-flex align-items-center">
					<img :src="getSummonerIcon(detail.profileIconId)" alt="Summoner Icon" class="icon-menu-image me-2">
					<span>{{ detail.gameName }}</span>
				</a>
			</li>
		</ul>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { getUrlHelper } from '../globalSetup.js'; 
const store = useStore();

const dropdownContainer = ref(null);
const dropdownOpen = ref(false);
const allPlayerDetails = computed(() => store.getters['summoner/getAllPlayerDetails']);
const isLoggedIn = computed(() => store.state.auth.isLoggedIn);

const currentSelection = computed(() => {
	const current = store.getters['summoner/getCurrentSummoner'];
	return current ?? allPlayerDetails.value[0];
});

const getSummonerIcon = (iconId) => {
	const urlHelper = getUrlHelper();
	return urlHelper.getSummonerIconUrl(iconId);
};
function handleClickOutside(event) {
	if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
		dropdownOpen.value = false;
	}
}
function selectSummoner(summonerDetail) {
	currentSelection.value = summonerDetail;
	store.commit('summoner/setCurrentSummoner', summonerDetail);
	dropdownOpen.value = false;
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
	if (!allPlayerDetails.value.length) {
		store.dispatch('summoner/fetchSummonerDataByAccountId');
	}
});

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.icon-image,
.icon-menu-image {
	width: 25px;
	height: 25px;
	border-radius: 50%;
	border: 2px solid #c0c0c0;
}

.dropdown-menu.show {
	display: block;
}

.level-pill {
	position: absolute;
	bottom: -5px;
	left: 5px;
	background-color: #000000;
	color: #d3d3d3;
	padding: 0px 6px;
	border-radius: 10px;
	font-size: 0.65rem;
	font-weight: bold;
}

.tag {
	text-transform: uppercase;
}
</style>
