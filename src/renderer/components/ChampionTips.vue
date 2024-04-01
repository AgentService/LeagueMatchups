<template>
	<div class="card-header-custom d-flex justify-content-between align-items-center">
		<span>Champion Tips</span>
	</div>
	<div class="overflow-auto d-flex flex-grow-1" v-if="championTips && Object.keys(championTips).length > 0">
		<transition name="fade" mode="out-in">
			<div class="card-body tips-card" :key="selectedTip">
				<div v-if="!selectedTip" class="flex-container d-flex ">
					<!-- Iterate over each key in championTips -->
					<div v-for="(value, key) in championTips" :key="key" class="flex-item">
						<!-- Button for each tip -->
						<button type="button" class="btn text-secondary justify-content-center align-items-center"
							@click="selectedTip = key">
							<i :class="['me-2', getIconForKey(key)]" aria-hidden="true"></i>
							<div class="text-content">{{ formatCategory(key) }}</div>
						</button>
					</div>
				</div>
				<div v-else class="content-container">
					<div class="details-header d-flex align-items-start">
						<h6 class="details-title">{{ formatCategory(selectedTip) }}</h6>
					</div>
					<div class="tip-details">
						<p>{{ championTips[selectedTip]?.long }}</p>
					</div>
					<button type="button" class="btn" @click="selectedTip = null">
						<i class="fas fa-chevron-left"></i> Back
					</button>
				</div>
			</div>
		</transition>
	</div>
	<div v-else class="card-body tips-card">
		<div class="content-container d-flex align-items-center justify-content-center">
			<div class="no-tips-message text-center">
				<p>No tips available for this champion.</p>
			</div>
		</div>
	</div>
</template>


<script setup>
import { computed, ref, watch } from 'vue';
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
	height: 100%;
	flex-direction: column;
	padding: 1rem;
	margin: auto;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	hyphens: auto;
	text-align:left;
}

.title-bar {
	text-align: center;
}

.flex-container {
	display: flex;
	flex-wrap: wrap;
	gap: .5rem;
	justify-content: space-between;
}

.flex-item {
	margin: 0 auto;
	flex: 0 1 calc(50% - 10px);
	display: flex;
	justify-content: center;
	align-items: center;
}

.grid-item {
	display: flex;
	flex-direction: column;
	height: 100%;
}

/* Fade In Animation */
@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

/* Fade Out Animation */
@keyframes fadeOut {
	from {
		opacity: 1;
	}

	to {
		opacity: 0;
	}
}

/* Transition Classes */
.fade-enter-active,
.fade-leave-active {
	animation-duration: 0.25s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
	opacity: 1;
}

.fade-enter-active {
	animation-name: fadeIn;
}

.fade-leave-active {
	animation-name: fadeOut;
}

.tip-details {
	color: var(--gold-1);
	overflow: auto;
	flex-grow: 1;
	font-weight: 500;
	padding: 0 1rem;

}

.details-header {
	color: var(--gold-1);
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-bottom: 1rem;
	padding: 0 1rem;
}

.details-title {
	flex-grow: 1;
	font-weight: 700;
	margin-bottom: .1rem;
}

.content-container {
	justify-content: start;
	align-items: start;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	height: 100%;
}
</style>