<template>
  <div class="container d-flex" v-if="championTips && Object.keys(championTips).length > 0">
    <div class="card">
      <div class="card-header title-bar">
        General Tips <!-- Header title -->
      </div>
      <transition name="fade" mode="out-in">
        <div class="card-body" :key="selectedTip">
          <div v-if="!selectedTip" class="flex-container">
            <!-- Iterate over each key in championTips -->
            <div v-for="(value, key) in championTips" :key="key" class="flex-item">
              <!-- Button for each tip -->
              <button type="button"
                class="btn btn-primary btn-full-width d-flex justify-content-center align-items-center"
                @click="selectedTip = key">
                <i :class="['me-3', getIconForKey(key)]" aria-hidden="true"></i>
                <div class="text-content">{{ formatCategory(key) }}</div>
              </button>
            </div>
          </div>
          <div v-else class="content-container">
            <div class="details-header mb-1">
              <!-- Back Button -->
              <button type="button" class="btn btn-secondary mb-1" @click="selectedTip = null">
                <i class="fas fa-chevron-left"></i>
              </button>
              <!-- Title next to back button -->
              <h6 class="details-title title-bar">{{ formatCategory(selectedTip) }}</h6>
            </div>
            <div class="tip-details">
              <p>{{ championTips[selectedTip]?.long }}</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script setup>
import { computed, ref, defineProps, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
	champion: Object,
	instanceId: Number
});

const store = useStore();
const championId = ref(props.champion?.id);
const championTips = computed(() => {
	return store.getters["champions/getChampionTips"](championId.value);
});
const selectedTip = ref(null);

const formatCategory = (key) => {
	if (!key) return "";
	key = key.replace(/([A-Z])/g, " $1").toLowerCase();
	key = key.replace(/^\w|\s\w/g, (str) => str.toUpperCase());
	return key.trim();
};

const getIconForKey = (category) => {
	const icons = {
		"identity": "fa-solid fa-user-circle",
		"strengths": "fa-solid fa-thumbs-up",
		"weaknesses": "fa-solid fa-thumbs-down",
		"earlygame": "fa-solid fa-hourglass-start",
		"midgame": "fa-solid fa-hourglass-half",
		"lategame": "fa-solid fa-hourglass-end",
		"teamfight": "fa-solid fa-shield-alt",
		"counter": "fa-solid fa-ban",
		"mindset": "fa-solid fa-brain",
		"insights": "fa-solid fa-lightbulb",
		// Define more icons for other categories if needed
	};
	return icons[category] || "fa-solid fa-question-circle"; // Fallback icon
};

watch(() => props.champion, (newChampion) => {
	if (newChampion && newChampion.id !== championId.value) {
		championId.value = newChampion.id;
	}
}, { immediate: true });

</script>


<style>
.title-bar {
  text-align: center;
  color: var(--gold-1);
  border-bottom: 0px solid var(--gold-4);
}

.container {
  width: 100%;
  /* Full width of the parent element */
  height: 100%;
  /* Full height of the parent element */
  /* Add if the parent of the container has a defined height, or use vh for viewport height */
}

.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

}

.flex-item {
  flex: 1 1;
  /* default for smaller screens - 2 items per row */
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

.btn-full-width {
  min-width: 150px;
  width: 100%;
}

.btn-full-height {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-item {
  display: flex;
  /* Make the grid item a flex container */
  flex-direction: column;
  /* Stack children vertically */
  height: 100%;
  /* Full height */
}

.btn small {
  color: aliceblue;
  font-size: 0.65em;
  /* Smaller font size for hints */
  opacity: 0.75;
  /* Slightly transparent for less prominence */
}

.button-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.tip-details {
  overflow: auto;
  flex-grow: 1;
}

.details-header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.details-title {
  margin-left: 0.5rem;
  /* Spacing between button and title */
  flex-grow: 1;
  /* Allow the title to take up remaining space if needed */
}

.content-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0;
}

/* Custom scrollbar styles */
.tip-details::-webkit-scrollbar {
  width: 0.75rem;
  /* Width of the scrollbar */
}

.tip-details::-webkit-scrollbar-thumb {
  background-color: #00aaff;
  /* Replace with your desired thumb color */
  border-radius: 6px;
}

.tip-details::-webkit-scrollbar-track {
  background-color: #000000;
  /* Replace with your desired track color */
}</style>