<template>
		<div class="card-header">
			General Tips <!-- Header title -->
		</div>
		<transition name="fade" mode="out-in">
			<div class="overflow-auto d-flex  flex-grow-1" v-if="championTips && Object.keys(championTips).length > 0">
				<div class="card-body tips-card" :key="selectedTip">
					<div v-if="!selectedTip" class="flex-container d-flex ">
						<!-- Iterate over each key in championTips -->
						<div v-for="(value, key) in championTips" :key="key" class="flex-item">
							<!-- Button for each tip -->
							<button type="button"
								class="btn text-secondary justify-content-center align-items-center"
								@click="selectedTip = key">
								<i :class="['me-2', getIconForKey(key)]" aria-hidden="true"></i>
								<div class="text-content">{{ formatCategory(key) }}</div>
							</button>
						</div>
					</div>
					<div v-else class="content-container">
						<div class="details-header d-flex align-items-center">
							<!-- Back Button -->
							<button type="button" class="btn" @click="selectedTip = null">
								<i class="fas fa-chevron-left"></i>
							</button>
							<!-- Title next to back button -->
							<h6 class="details-title">{{ formatCategory(selectedTip) }}</h6>
						</div>
						<div class="tip-details">
							<!-- Debugging-Log -->
							<p>{{ championTips[selectedTip]?.long }}</p>
						</div>
					</div>
				</div>
			</div>
			<div v-else class="card-body tips-card">
				<div class="content-container d-flex align-items-center justify-content-center">
					<div class="no-tips-message text-center">
						<p>No tips available for this champion.</p>
					</div>
				</div>
			</div>
		</transition>
</template>


<script setup>
import { computed, ref, defineProps, watch } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
	champion: Object,
	instanceId: Number
});

const store = useStore();
const championId = ref(props.champion?.id);
const championTips = computed(() => {
	return store.getters['champions/getChampionTips'](championId);
});
const selectedTip = ref(null);

const formatCategory = (key) => {
	if (!key) return '';
	key = key.replace(/([A-Z])/g, ' $1').toLowerCase();
	key = key.replace(/^\w|\s\w/g, (str) => str.toUpperCase());
	return key.trim();
};

const getIconForKey = (category) => {
	const icons = {
		'identity': 'fa-solid fa-user-circle',
		'strengths': 'fa-solid fa-thumbs-up',
		'weaknesses': 'fa-solid fa-thumbs-down',
		'earlygame': 'fa-solid fa-hourglass-start',
		'midgame': 'fa-solid fa-hourglass-half',
		'lategame': 'fa-solid fa-hourglass-end',
		'teamfight': 'fa-solid fa-shield-alt',
		'counter': 'fa-solid fa-ban',
		'mindset': 'fa-solid fa-brain',
		'insights': 'fa-solid fa-lightbulb',
		// Define more icons for other categories if needed
	};
	return icons[category] || 'fa-solid fa-question-circle'; // Fallback icon
};

watch(() => props.champion, (newChampion) => {
	if (newChampion && newChampion.id !== championId.value) {
		championId.value = newChampion.id;
	}
}, { immediate: true });

</script>


<style>
.tips-card {
	display: flex;
	min-height: 100%;
	flex-direction: column;
	padding: 1rem;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	hyphens: auto; 
	text-align: justify;
}
.title-bar {
	text-align: center;
}



.flex-container {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	justify-content: start;
}

.flex-item {
	flex: 0 1 calc(50% - 10px); /* 2 items per row for smaller screens */
    display: flex;
    justify-content: center;
    align-items: center;
	
}

/* Enter and leave transitions */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.10s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.grid-item {
	display: flex;
	flex-direction: column;
	height: 100%;

}

.tip-details {
	overflow: auto;
	flex-grow: 1;
	padding: 1rem;
	font-weight: 400;
}

.details-header {
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.details-title {
	flex-grow: 1;
	font-weight: 600;
	margin-bottom: .1rem;
}

.content-container {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	height: 100%;
}
</style>