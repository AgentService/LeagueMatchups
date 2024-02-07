<template>
	<div class="card-header d-flex justify-content-between align-items-center">
		<span>Review Notes</span>
		<transition name="fade">
			<i v-if="autoSaved" key="autoSaved" class="fas fa-check-circle text-success"></i>
		</transition>
		<div class="buttons-container">
			<button @click="createNewNote" class="btn add-button">
				<i class="fas fa-plus"></i>
			</button>
		</div>
	</div>
	<!-- Notes list -->
	<div class="notes-list card-body">
		<li v-for="item in limitedNotes" :key="item.date" class="note-item mb-4">
			<textarea spellcheck="false" v-model="noteText[item.date]" class="note-textarea"
				placeholder="Type your notes here..." rows="6"></textarea>
			<div class="note-footer d-flex">
				<div class="note-date">{{ formatDate(item.date) }}</div>
				<div class="buttons-container d-flex justify-content-end">
					<button @click="deleteNote(item.date)" class="btn delete-button">
						<i class="far fa-trash-alt"></i>
					</button>
					<button @click="saveNote(item.date)" class="btn save-button">
						<i class="far fa-save"></i>
					</button>
				</div>
			</div>
		</li>
		<div class="show-more-container">
			<button v-if="!isExpanded.value && notesOrdered.length > notesDisplayLimit" @click="showMoreNotes" class="btn">
				Show More
			</button>
			<button v-else @click="showLessNotes" class="btn">
				Show Less
			</button>
		</div>

	</div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const noteText = ref({});
const notesDisplayLimit = ref(2);
const isExpanded = ref(false);
const notesByDate = computed(() => store.state.notes.generalNotes);

const limitedNotes = computed(() => {
	return notesOrdered.value.slice(0, notesDisplayLimit.value);
});


const showMoreNotes = () => {
	notesDisplayLimit.value += 2; 
	isExpanded.value = true;
	console.log("Show More clicked. Display limit:", notesDisplayLimit.value, "Is Expanded:", isExpanded.value);
};

const showLessNotes = () => {
	notesDisplayLimit.value = 2; // Reset to initial limit
	isExpanded.value = false;
	console.log("Show Less clicked. Display limit:", notesDisplayLimit.value, "Is Expanded:", isExpanded.value);
};


const notesOrdered = computed(() => {
	return Object.entries(notesByDate.value)
		.sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
		.map(([date, note]) => ({ date, note }));
});



const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric', month: 'long', day: 'numeric'
	});
};

const fetchNotes = async () => {
	try {
		await store.dispatch('notes/fetchGeneralNotes');
		// The Vuex state is automatically updated, so your UI should react to these changes
	} catch (error) {
		console.error('Error while fetching notes:', error);
		// Handle the error as needed
	}
};

const createNewNote = () => {
	const currentDate = new Date().toISOString().split('T')[0];
	if (!store.state.notes.generalNotes[currentDate]) {
		const newNote = ''; // Default content for the new note
		// Commit the new note to the Vuex state and save it to the backend
		store.dispatch('notes/saveGeneralNote', { date: currentDate, note: newNote });
	} else {
		console.log("A note for today already exists.");
	}
};


const deleteNote = (date) => {
	store.dispatch('notes/deleteGeneralNote', date).then(() => {
	});
};

const saveNote = (date) => {
	const note = noteText.value[date];
	store.dispatch('notes/saveGeneralNote', { date, note });
};

onMounted(() => {
	const currentDate = new Date().toISOString().split('T')[0];
	// Ensure there's an entry for the current day
	if (!noteText.value[currentDate]) {
		noteText.value[currentDate] = '';
	}
	fetchNotes().then(() => {
		for (const [date, note] of Object.entries(notesByDate.value)) {
			noteText.value[date] = note;
		}
	});
});
</script>

<style>
.buttons-container {
	display: flex;
	align-items: start;
	justify-content: flex-end;
	gap: 5px;
}

.show-more-container {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 10px;
	/* Optional spacing from the preceding content */
}

.show-more-button {
	margin-top: 10px;
	color: var(--gold-2);
	border: 1px solid var(--gold-6);
}

.note-date {
	position: relative;
	font-size: 0.875rem;
	color: var(--grey-3);
}

.note-item {
	height: 100%;
	display: flex;
	flex-direction: column;
}

/* Container that holds all note items */
.notes-list {
	overflow-y: auto;
	flex-grow: 1;
}


.note-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
