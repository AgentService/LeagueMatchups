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
			<!-- LO Selection Area on the Left (Reduced Width) -->
			<div class="w-1/4 lo-list">
				<!-- In-Game Objectives -->
				<div class="text-gray-400 mb-2 font-bold uppercase">In-Game</div>
				<ul class="space-y-2 p-0">
					<li v-for="lo in activeObjectives['In-Game']" :key="lo.name"
						@click="selectLearningObjective(lo, 'In-Game')"
						:class="{ 'selected-lo': selectedLO && selectedLO.name === lo.name }" class="lo-item">
						<span>{{ lo.name }}</span>
					</li>
				</ul>

				<!-- Out-of-Game Objectives -->
				<div class="text-gray-400 mt-4 mb-2 font-bold uppercase">Out-of-Game</div>
				<ul class="space-y-2 p-0">
					<li v-for="lo in activeObjectives['Out-of-Game']" :key="lo.name"
						@click="selectLearningObjective(lo, 'Out-of-Game')"
						:class="{ 'selected-lo': selectedLO && selectedLO.name === lo.name }" class="lo-item">
						<span>{{ lo.name }}</span>
					</li>
				</ul>
			</div>

			<!-- Reflection Section on the Right (Increased Width) -->
			<div class="w-3/4 text-center space-y-4 bg-gray-800 p-4 rounded-lg flex flex-col">
				<h5 class="text-white font-semibold">
					{{ selectedLO ? selectedLO.name : 'Select a Learning Objective' }}
				</h5>

				<!-- Reflection Container -->
				<div v-if="selectedPredefinedLO" class="lo-reflection-container flex flex-col flex-1">
					<!-- Reflections List -->
					<ul ref="reflectionsList" class="reflections-list space-y-6 overflow-y-auto p-0 pe-3">
						<li v-for="(reflections, date) in groupedReflections" :key="date" class="date-group">
							<!-- Date Header -->
							<div class="date-header text-center text-gray-500 mb-2">
								{{ date }}
							</div>

							<!-- Reflections for the Date -->
							<ul class="space-y-4">
								<li v-for="(reflection, index) in reflections" :key="index"
									class="reflection-item relative">
									<!-- Delete Button -->
									<button @click="removeReflection(getReflectionIndex(reflection))"
										class="delete-button" aria-label="Delete Reflection">
										<i class="fas fa-times fa-xs"></i>
									</button>

									<!-- Reflection Content -->
									<div class="reflection-content">
										<span class="reflection-text">{{ reflection.text }}</span>
										<div class="reflection-timestamp">{{ formatTime(reflection.timestamp) }}</div>
									</div>
								</li>
							</ul>
						</li>
					</ul>

					<!-- Input Field and Button at Bottom -->
					<div class="reflection-input-container flex mt-2">
						<input type="text" v-model="newReflection" placeholder="Reflect on this LO..."
							class="reflection-input flex-1 bg-gray-200 p-2 rounded-l-lg outline-none" />
						<button @click="addReflection"
							class="btn-reflect bg-green-500 text-white py-2 px-4 rounded-r-lg hover:bg-green-400">
							Add
						</button>
					</div>
				</div>

				<!-- CTA Container when no LO is selected -->
				<div v-else class="lo-cta-container flex items-center justify-center flex-1">
					<button @click="toggleLOSelector"
						class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
						Select Learning Objectives
					</button>
				</div>
			</div>
		</div>

		<!-- Modal for Selecting Learning Objectives -->
		<TransitionRoot :show="showLOSelector" as="template">
			<Dialog as="div" class="fixed inset-0 flex items-center justify-center z-50" @close="closeLOSelector">
				<DialogOverlay class="fixed inset-0 bg-black opacity-50"></DialogOverlay>
				<div class="bg-gray-800 rounded-lg p-6 z-10 w-full max-w-xl mx-auto">
					<button class="absolute top-3 right-3 text-gray-300" @click="closeLOSelector"
						aria-label="Close Modal">
						✖
					</button>
					<DialogTitle class="text-lg font-bold text-white">Manage Learning Objectives</DialogTitle>
					<span class="text-gray-400">Select up to 2 Learning Objectives for each category.</span>
					<div class="mt-4 space-y-4">
						<div v-for="category in Object.keys(predefinedObjectives)" :key="category" class="space-y-2">
							<div class="text-white font-semibold text-m">{{ category }}</div>
							<ul class="space-y-1 p-0">
								<li v-for="lo in predefinedObjectives[category]" :key="lo.name"
									class="flex justify-between items-center cursor-pointer p-2 rounded-lg transition bg-gray-700 hover:bg-gray-600">
									<span @click="toggleLOSelection(lo, category)"
										:class="{ 'text-green-400': isLOSelected(lo, category) }">
										{{ lo.name }}
									</span>
									<button @click="deleteLO(lo, category)" class="text-red-500 ml-2"
										aria-label="Delete LO">
										<i class="fas fa-trash"></i>
									</button>
								</li>
							</ul>
						</div>

						<!-- Add New LO Section -->
						<div class="mt-4">
							<div class="text-white font-semibold text-lg">Add New Learning Objective</div>
							<div class="flex space-x-2 mt-2">
								<input type="text" v-model="newLOName" placeholder="LO Name"
									class="flex-1 p-2 rounded bg-gray-700 text-white outline-none" />
								<select v-model="newLOCategory" class="p-2 rounded bg-gray-700 text-white outline-none">
									<option disabled value="">Select Category</option>
									<option v-for="category in Object.keys(predefinedObjectives)" :key="category"
										:value="category">
										{{ category }}
									</option>
								</select>
								<button @click="addNewLO" :disabled="isDuplicateLO"
									class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed">
									Add
								</button>
							</div>
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
import { ref, computed, onUpdated, onMounted, watch } from 'vue';
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot } from '@headlessui/vue';
import { useStore } from 'vuex';
import dayjs from 'dayjs'; // Ensure dayjs is imported
import { debounce } from 'lodash'; // Import debounce from lodash

const store = useStore();
const showLOSelector = ref(false);
const selectedLO = ref(null);
const newReflection = ref("");
const reflectionsList = ref(null);

// Modal state for adding new LO
const newLOName = ref("");
const newLOCategory = ref("");

// Access Vuex store getters
const activeObjectives = computed(() => store.getters['learningObjectives/getAllActiveObjectives'] || { "In-Game": [], "Out-of-Game": [] });
const predefinedObjectives = computed(() => store.getters['learningObjectives/getAllPredefinedObjectives'] || { "In-Game": [], "Out-of-Game": [] });

// Computed property to get the selected LO from predefinedObjectives
const selectedPredefinedLO = computed(() => {
	if (!selectedLO.value) return null;
	const { name, category } = selectedLO.value;
	return predefinedObjectives.value[category].find(lo => lo.name === name) || null;
});

// Function to toggle LO selector modal
function toggleLOSelector() {
	showLOSelector.value = !showLOSelector.value;
}

// Function to confirm LO selection (closes modal)
function confirmLOSelection() {
	showLOSelector.value = false;
}

// Helper method to format time
function formatTime(timestamp) {
	return dayjs(timestamp).format('h:mm A'); // Example: 3:45 PM
}

// Helper method to get the actual index of a reflection
function getReflectionIndex(reflection) {
	const allReflections = selectedPredefinedLO.value.reflections;
	return allReflections.findIndex((ref) => ref.timestamp === reflection.timestamp && ref.text === reflection.text);
}

// Function to close LO selector modal
function closeLOSelector() {
	showLOSelector.value = false;
}

// Function to toggle LO selection
function toggleLOSelection(lo, category) {
	if (!activeObjectives.value[category]) return;
	const isActive = activeObjectives.value[category].some(activeLO => activeLO.name === lo.name);
	if (isActive) {
		store.dispatch('learningObjectives/removeActiveObjective', { loName: lo.name, category });
		if (selectedLO.value && selectedLO.value.name === lo.name && selectedLO.value.category === category) {
			// If the removed LO was selected, select another LO
			selectInitialLO();
		}
	} else if (activeObjectives.value[category].length < 2) {
		store.dispatch('learningObjectives/addActiveObjective', { lo, category });
		if (!selectedLO.value) {
			selectedLO.value = { name: lo.name, category };
		}
	}
}

// Function to check if LO is selected
function isLOSelected(lo, category) {
	return activeObjectives.value[category]?.some(activeLO => activeLO.name === lo.name);
}

// Function to select a learning objective
function selectLearningObjective(lo, category) {
	selectedLO.value = { name: lo.name, category };
}

// Function to add a reflection
function addReflection() {
	if (selectedLO.value && newReflection.value.trim()) {
		store.dispatch('learningObjectives/addReflection', {
			loName: selectedLO.value.name,
			category: selectedLO.value.category,
			text: newReflection.value.trim(),
		});
		newReflection.value = "";
	}
}

// Function to remove a reflection
function removeReflection(index) {
	if (selectedLO.value) {
		const currentScrollTop = reflectionsList.value.scrollTop;

		store.dispatch('learningObjectives/removeReflection', {
			loName: selectedLO.value.name,
			category: selectedLO.value.category,
			index,
		}).then(() => {
			reflectionsList.value.scrollTop = currentScrollTop;
		});
	}
}

const isDuplicateLO = computed(() => {
	const trimmedName = newLOName.value.trim().toLowerCase();
	if (!trimmedName || !newLOCategory.value) return false;
	return predefinedObjectives.value[newLOCategory.value].some(
		(lo) => lo.name.toLowerCase() === trimmedName
	);
});

// Function to add a new LO
function addNewLO() {
	const trimmedName = newLOName.value.trim();
	if (!trimmedName || !newLOCategory.value) return;

	// Check for duplicate LO name
	const exists = predefinedObjectives.value[newLOCategory.value].some(
		(lo) => lo.name.toLowerCase() === trimmedName.toLowerCase()
	);

	if (exists) {
		alert('A Learning Objective with this name already exists.');
		return;
	}

	const newLO = {
		name: trimmedName,
		gamesApplied: 0,
		reflections: []
	};
	store.dispatch('learningObjectives/addPredefinedObjective', { lo: newLO, category: newLOCategory.value });
	newLOName.value = "";
	newLOCategory.value = "";
}

// Function to delete a LO
function deleteLO(lo, category) {
	store.dispatch('learningObjectives/deletePredefinedObjective', { loName: lo.name, category });
	// If the deleted LO is active, remove it
	if (activeObjectives.value[category]?.some(activeLO => activeLO.name === lo.name)) {
		store.dispatch('learningObjectives/removeActiveObjective', { loName: lo.name, category });
		if (selectedLO.value && selectedLO.value.name === lo.name && selectedLO.value.category === category) {
			// If the removed LO was selected, select another LO
			selectInitialLO();
		}
	}
}

// Function to select the initial LO
function selectInitialLO() {
	const inGameLOs = activeObjectives.value['In-Game'];
	if (inGameLOs?.length > 0) {
		selectedLO.value = { name: inGameLOs[0].name, category: 'In-Game' };
		return;
	}
	const outOfGameLOs = activeObjectives.value['Out-of-Game'];
	if (outOfGameLOs?.length > 0) {
		selectedLO.value = { name: outOfGameLOs[0].name, category: 'Out-of-Game' };
		return;
	}
	// No active LOs
	selectedLO.value = null;
}

// On component mount, select the initial LO
onMounted(() => {
	selectInitialLO();
});

// Watch for changes in activeObjectives to ensure selectedLO is valid
watch(
	activeObjectives,
	() => {
		if (selectedLO.value) {
			const exists = activeObjectives.value[selectedLO.value.category].some(lo => lo.name === selectedLO.value.name);
			if (!exists) {
				selectInitialLO();
			}
		} else {
			selectInitialLO();
		}
	},
	{ deep: true }
);

// Debounced function to scroll to bottom
const scrollToBottom = debounce(() => {
	if (reflectionsList.value) {
		reflectionsList.value.scrollTop = reflectionsList.value.scrollHeight;
	}
}, 222);

// Automatically scroll to the bottom when a new reflection is added
onUpdated(() => {
	scrollToBottom();
});

// Computed property to group reflections by date
const groupedReflections = computed(() => {
	if (!selectedPredefinedLO.value) return {};

	// Clone and sort reflections by timestamp in ascending order
	const sortedReflections = [...selectedPredefinedLO.value.reflections].sort((a, b) => {
		return dayjs(a.timestamp).isAfter(dayjs(b.timestamp)) ? 1 : -1;
	});

	// Group reflections by formatted date
	return sortedReflections.reduce((groups, reflection) => {
		const date = dayjs(reflection.timestamp).format('MMMM D, YYYY');
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(reflection);
		return groups;
	}, {});
});
</script>


<style scoped>
.learning-objectives-section {
	overflow: hidden;
	background-color: #1e1e2d;
	border-radius: 12px;
	position: relative;
	display: flex;
	flex-direction: column;
	color: var(--gold-1);
	background-image: linear-gradient(to right, #091014, #091014);
}

.lo-reflection-container {
	max-height: 500px;
	min-height: 500px;
	display: flex;
	flex-direction: column;
	flex: 1;
	border-radius: 8px;
	overflow-y: hidden;
}

.reflections-list {
	flex: 1;
	overflow: hidden;
}


.date-header {
	font-size: 0.875rem;
	padding: 0;
	width: fit-content;
	margin: 0 auto;
}

.reflection-item {
	color: #d1d5db;
	font-size: 0.875rem;
	display: flex;
	flex-direction: column;
	align-self: flex-end;
	max-width: 100%;
	position: relative;
}

.reflection-content {
	background-color: #2a2a3b;
	padding: 1rem;
	padding-right: 1.1rem;
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.reflection-text {
	text-align: left;
}

.reflection-timestamp {
	font-size: 0.65rem;
	color: #9ca3af;
	margin-top: 0.25rem;
	text-align: right;
}

.delete-button {
	position: absolute;
	top: -4px;
	right: -8px;
	background: transparent;
	border: none;
	color: #f87171;
	cursor: pointer;
	opacity: 0.0;
	transition: color 0.2s;
}

.reflection-item:hover .delete-button {
	opacity: 1;
}

.reflection-input-container {
	display: flex;
	margin-top: auto;
}

.reflection-input {
	border: none;
	outline: none;
	padding: 8px;
	border-radius: 4px 0 0 4px;
	background-color: #1e1e2d;
	color: #f1f1f1;
}

.btn-reflect {
	background-color: #28a745;
	border: none;
	color: white;
	padding: 8px;
	cursor: pointer;
	border-radius: 0 4px 4px 0;
	transition: background 0.2s;
}

.btn-reflect:hover {
	background-color: #218838;
}

.lo-list {
	width: 33%;
}

.lo-item {
	padding: 0.5rem;
	border-radius: 8px;
	cursor: pointer;
	background-color: #2a2a3b;
	color: #d1d5db;
	transition: background 0.2s, color 0.2s;
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.lo-item:hover {
	background-color: #3a3a4b;
}

.selected-lo {
	background-color: #4e6b91;
	color: white;
	font-weight: bold;
}

.reflections-list li {
	align-items: flex-end;
}

.reflections-list li span {
	flex: 1;
	min-width: 0;
	text-align: left;
}

.lo-cta-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}

.reflection-item .reflection-timestamp {
	align-self: flex-end;
}

.modal-content {
	background-color: #1e1e2d;
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
