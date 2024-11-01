<template>
	<div class="learning-objectives-section card-widget mb-2">
		<!-- Header with Settings Button -->
		<div class="card-header-custom justify-content-between">
			<span>Learning Objectives</span>
			<button class="btn settings-button" @click="toggleLOSelector" aria-label="Select Learning Objectives">
				<i class="fa fa-lg fa-cog"></i>
			</button>
		</div>

		<!-- Main Widget Content (Always Visible) -->
		<div class="lo-main-container">
			<!-- Compact LO List on the left -->
			<div class="lo-list">
				<div>In-Game</div>
				<ul class="lo-items">
					<li v-for="lo in activeObjectives['In-Game']" :key="lo.name"
						@click="selectLearningObjective(lo, 'In-Game')"
						:class="{ 'lo-selected': selectedLO && selectedLO.name === lo.name }">
						<span>{{ lo.name }}</span>
					</li>
				</ul>

				<div>Out-of-Game</div>
				<ul class="lo-items">
					<li v-for="lo in activeObjectives['Out-of-Game']" :key="lo.name"
						@click="selectLearningObjective(lo, 'Out-of-Game')"
						:class="{ 'lo-selected': selectedLO && selectedLO.name === lo.name }">
						<span>{{ lo.name }}</span>
					</li>
				</ul>
			</div>

			<!-- Reflection Section on the right -->
			<div class="lo-reflection-container">
				<h4>{{ selectedLO ? selectedLO.name : 'Select a Learning Objective' }}</h4>
				<p v-if="selectedLO">Games Applied: {{ selectedLO.gamesApplied }}</p>

				<div v-if="selectedLO">
					<input type="text" v-model="newReflection" placeholder="Reflect on this LO..."
						class="reflection-input" />
					<button @click="addReflection" class="btn-reflect">Add</button>
					<ul class="reflection-list">
						<li v-for="(reflection, index) in selectedLO.reflections" :key="index">
							{{ reflection }}
							<button @click="removeReflection(index)" class="btn-delete-reflection">
								<i class="fas fa-times"></i>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Modal (Visible on Button Click) -->
		<div class="modal-overlay" v-if="showLOSelector" @click="closeLOSelector" role="dialog" aria-modal="true">
			<div class="questionnaire-modal" @click.stop>
				<!-- Close Button -->
				<button class="close-button" @click="closeLOSelector" aria-label="Close Modal">✖</button>

				<!-- Modal Header -->
				<div class="modal-title">Select or Add Learning Objectives</div>

				<!-- LO Selector Content -->
				<div class="lo-selector-content">
					<div v-for="category in Object.keys(predefinedObjectives)" :key="category"
						class="lo-selector-category">
						<h4>{{ category }}</h4>
						<ul>
							<li v-for="lo in predefinedObjectives[category]" :key="lo.name"
								@click="toggleLOSelection(lo, category)"
								:class="{ 'selected': isLOSelected(lo, category) }">
								{{ lo.name }}
							</li>
						</ul>
					</div>
					<button @click="confirmLOSelection" class="btn-close-selector">Done</button>
				</div>
			</div>
		</div>
	</div>
</template>



<script setup>
import { ref, computed } from 'vue';
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

// Confirm LO selection and close the selector
function confirmLOSelection() {
	showLOSelector.value = false;
}

function closeLOSelector() {
	showLOSelector.value = false;
}

// Toggle selection of a learning objective
function toggleLOSelection(lo, category) {
	if (!activeObjectives.value[category]) return;

	const isActive = activeObjectives.value[category].some(activeLO => activeLO.name === lo.name);

	if (isActive) {
		store.dispatch('learningObjectives/removeActiveObjective', { loName: lo.name, category });
	} else if (activeObjectives.value[category].length < 2) {
		store.dispatch('learningObjectives/addActiveObjective', { lo, category });
	}
}

// Check if an LO is selected in the current category
function isLOSelected(lo, category) {
	return activeObjectives.value[category]?.some(activeLO => activeLO.name === lo.name);
}

// Modify selectLearningObjective to include category
function selectLearningObjective(lo, category) {
	selectedLO.value = { ...lo, category }; // Attach category to selectedLO
}

// Add a new reflection to the selected LO
function addReflection() {
	if (selectedLO.value && newReflection.value.trim()) {
		store.dispatch('learningObjectives/addReflection', {
			loName: selectedLO.value.name,
			category: selectedLO.value.category, // This should now always be defined
			reflection: newReflection.value
		});
		newReflection.value = "";
	}
}


// Remove a reflection from the selected LO
function removeReflection(index) {
	if (selectedLO.value) {
		store.dispatch('learningObjectives/removeReflection', {
			loName: selectedLO.value.name,
			category: selectedLO.value.category,
			index
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
