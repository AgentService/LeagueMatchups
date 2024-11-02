<template>
	<div class="learning-objectives-section card-widget mb-2">
		<!-- Header with Settings Button -->
		<div class="flex justify-between items-center p-4 bg-gray-800 rounded-t-lg">
			<span class="text-white font-semibold">Learning Objectives</span>
			<button @click="toggleLOSelector" class="text-white" aria-label="Select Learning Objectives">
				<i class="fa fa-lg fa-cog"></i>
			</button>
		</div>

		<!-- Main Widget Content (Always Visible) -->
		<div class="p-4 flex space-x-4 bg-gray-900 rounded-b-lg">
			<!-- Compact LO List on the left -->
			<div class="w-1/3">
				<div class="text-white mb-2 font-semibold">In-Game</div>
				<ul class="space-y-2">
					<li v-for="lo in activeObjectives['In-Game']" :key="lo.name"
						@click="selectLearningObjective(lo, 'In-Game')"
						:class="{ 'bg-blue-600': selectedLO && selectedLO.name === lo.name }"
						class="p-2 bg-gray-700 rounded-lg cursor-pointer text-white transition hover:bg-gray-600">
						<span>{{ lo.name }}</span>
					</li>
				</ul>

				<div class="text-white mt-4 mb-2 font-semibold">Out-of-Game</div>
				<ul class="space-y-2">
					<li v-for="lo in activeObjectives['Out-of-Game']" :key="lo.name"
						@click="selectLearningObjective(lo, 'Out-of-Game')"
						:class="{ 'bg-blue-600': selectedLO && selectedLO.name === lo.name }"
						class="p-2 bg-gray-700 rounded-lg cursor-pointer text-white transition hover:bg-gray-600">
						<span>{{ lo.name }}</span>
					</li>
				</ul>
			</div>

			<!-- Reflection Section on the right -->
			<div class="w-2/3 space-y-4 bg-gray-800 p-4 rounded-lg">
				<h4 class="text-white font-semibold">{{ selectedLO ? selectedLO.name : 'Select a Learning Objective' }}
				</h4>
				<!-- <p v-if="selectedLO" class="text-gray-300">Games Applied: {{ selectedLO.gamesApplied }}</p> -->

				<div v-if="selectedLO" class="space-y-2">
					<input type="text" v-model="newReflection" placeholder="Reflect on this LO..."
						class="w-full p-2 rounded-lg bg-gray-200 outline-none" />
					<button @click="addReflection"
						class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-400">
						Add
					</button>
					<ul class="space-y-2">
						<li v-for="(reflection, index) in selectedLO.reflections" :key="index"
							class="flex justify-between items-center bg-gray-700 p-2 rounded-lg text-white">
							<span>{{ reflection }}</span>
							<button @click="removeReflection(index)" class="text-red-500">
								<i class="fas fa-times"></i>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Modal for Selecting Learning Objectives -->
		<TransitionRoot :show="showLOSelector" as="template">
			<Dialog as="div" class="fixed inset-0 flex items-center justify-center z-50" @close="closeLOSelector">
				<DialogOverlay class="fixed inset-0 bg-black opacity-50"></DialogOverlay>
				<div class="bg-white rounded-lg p-6 z-10 w-full max-w-lg mx-auto">
					<!-- Close Button -->
					<button class="absolute top-3 right-3 text-gray-500" @click="closeLOSelector"
						aria-label="Close Modal">
						✖
					</button>

					<!-- Modal Header -->
					<DialogTitle class="text-lg font-bold text-gray-800">Select or Add Learning Objectives</DialogTitle>

					<!-- LO Selector Content -->
					<div class="mt-4 space-y-4">
						<div v-for="category in Object.keys(predefinedObjectives)" :key="category" class="space-y-2">
							<h4 class="text-gray-800 font-semibold">{{ category }}</h4>
							<ul class="space-y-1">
								<li v-for="lo in predefinedObjectives[category]" :key="lo.name"
									@click="toggleLOSelection(lo, category)"
									:class="{ 'bg-green-500 text-white': isLOSelected(lo, category) }"
									class="cursor-pointer p-2 rounded-lg transition bg-gray-100 hover:bg-gray-200">
									{{ lo.name }}
								</li>
							</ul>
						</div>
						<button @click="confirmLOSelection"
							class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-400">
							Done
						</button>
					</div>
				</div>
			</Dialog>
		</TransitionRoot>

	</div>
</template>



<script setup>
import { ref, computed } from 'vue';
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot } from '@headlessui/vue';
import { useStore } from 'vuex';

const store = useStore();
const showLOSelector = ref(false);
const selectedLO = ref(null);
const newReflection = ref("");

// Access active objectives and predefined objectives from Vuex store
const activeObjectives = computed(() => store.state.learningObjectives?.activeObjectives || { "In-Game": [], "Out-of-Game": [] });
const predefinedObjectives = computed(() => store.state.learningObjectives?.predefinedObjectives || {});

// Toggle LO selector visibility
function toggleLOSelector() {
	showLOSelector.value = !showLOSelector.value;
}

function confirmLOSelection() {
	showLOSelector.value = false;
}

function closeLOSelector() {
	showLOSelector.value = false;
}

function toggleLOSelection(lo, category) {
	if (!activeObjectives.value[category]) return;
	const isActive = activeObjectives.value[category].some(activeLO => activeLO.name === lo.name);
	if (isActive) {
		store.dispatch('learningObjectives/removeActiveObjective', { loName: lo.name, category });
	} else if (activeObjectives.value[category].length < 2) {
		store.dispatch('learningObjectives/addActiveObjective', { lo, category });
	}
}

function isLOSelected(lo, category) {
	return activeObjectives.value[category]?.some(activeLO => activeLO.name === lo.name);
}

function selectLearningObjective(lo, category) {
	selectedLO.value = { ...lo, category };
}

function addReflection() {
	if (selectedLO.value && newReflection.value.trim()) {
		store.dispatch('learningObjectives/addReflection', {
			loName: selectedLO.value.name,
			category: selectedLO.value.category,
			reflection: newReflection.value,
		});
		newReflection.value = "";
	}
}

function removeReflection(index) {
	if (selectedLO.value) {
		store.dispatch('learningObjectives/removeReflection', {
			loName: selectedLO.value.name,
			category: selectedLO.value.category,
			index,
		});
	}
}
</script>
<style scoped>
/* Custom adjustments specific to the Learning Objectives modal */
.questionnaire-modal {
	width: 50vh;
	/* Adjust modal width as per design */
	height: 60vh;
	/* Adjust modal height */
}

.lo-main-container {
	display: flex;
	gap: 20px;
}

.lo-list {
	width: 33%;
}

.lo-items li {
	display: flex;
	justify-content: space-between;
	padding: 0.5rem;
	background: #2a2a3b;
	margin-bottom: 5px;
	border-radius: 5px;
	cursor: pointer;
	transition: background 0.2s ease;
}

.lo-items li:hover {
	background: #3a3a4b;
}

.lo-selected {
	background-color: #4e6b91;
}

.lo-reflection-container {
	background-color: #2a2a3b;
	padding: 15px;
	border-radius: 8px;
	overflow-y: auto;
	max-height: 220px;
}

.reflection-input {
	width: calc(100% - 80px);
	padding: 8px;
	border-radius: 4px;
	border: none;
	outline: none;
	color: #1e1e2d;
}

.btn-reflect {
	background-color: #28a745;
	border: none;
	color: white;
	padding: 8px;
	border-radius: 5px;
	cursor: pointer;
}

.btn-close-selector {
	background-color: #42b883;
	color: white;
	padding: 8px 15px;
	border-radius: 6px;
	cursor: pointer;
	margin-top: 15px;
	border: none;
}
</style>
