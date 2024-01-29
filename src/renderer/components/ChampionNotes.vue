<template>
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>Champion Notes</span>
        <transition name="fade">
            <i v-if="autoSaved" key="autoSaved" class="fas fa-check-circle text-success"></i>
        </transition>
        <div class="buttons-container">
            <button @click="saveChampionNotes" :class="['btn', 'save-button', { 'btn-success': isSaved }]">
                <i class="far fa-save"></i>
            </button>
        </div>
    </div>
    <div class="card-body ">
        <textarea spellcheck="false" v-model="editableNotes" placeholder="Type your notes here..." class="note-textarea zeee" rows="8"></textarea>
    </div>
</template>


<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

import Debug from 'debug';
const debug = Debug('app:component:ChampionNotes');
const store = useStore();

// Computed property for getting current champion A
const championA = computed(() => store.getters['matchups/getChampionA']);
const championId = ref(''); // Initialize as an empty string
const editableNotes = ref('');

const autoSaved = ref(false);
const isSaved = ref(false);

// Function to fetch and set the notes for the current champion
async function fetchAndSetNotes(currentChampionId) {
	await store.dispatch('champions/fetchCustomChampionData', { championId: currentChampionId });
	editableNotes.value = store.getters['champions/getChampionCustomData'](currentChampionId).personalNotes || '';
	isSaved.value = false;
}

// Watch for changes in championA and update championId and notes accordingly
watch(championA, async (newChampionA) => {
	if (newChampionA && newChampionA.id !== championId.value) {
		championId.value = newChampionA.id;
		await fetchAndSetNotes(championId.value);
	}
}, { immediate: true });

onMounted(async () => {
	if (championA.value && championA.value.id) {
		championId.value = championA.value.id;
		await fetchAndSetNotes(championId.value);
	}
});

async function saveChampionNotes() {
	try {
		await store.dispatch('champions/updateCustomChampionData', {
			championId: championId.value,
			dataToUpdate: editableNotes.value,
			type: 'notes'
		});
		isSaved.value = true;

		// Set a timer to revert isSaved back to false after 2 seconds
		setTimeout(() => {
			isSaved.value = false;
		}, 1000);

	} catch (error) {
		console.error('Error saving notes:', error);
		// Handle error
	}
}

</script>



<style scoped>



</style>
