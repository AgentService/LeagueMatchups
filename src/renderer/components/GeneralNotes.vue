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
		<li v-for="item in limitedNotes" :key="item.date" class="note-item  mb-4">
			<textarea spellcheck="false" v-model="noteText[item.date]" class="note-textarea" placeholder="Type your notes here..."
				rows="6"></textarea>
			<div class="note-footer d-flex">
				<div class="note-date">{{ formatDate(item.date) }}</div>
				<div class="buttons-container d-flex justify-content-end">
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
const newNoteText = ref('');
const noteText = ref({});
const notesDisplayLimit = ref(2);
const isExpanded = ref(false);

const limitedNotes = computed(() => {
	return notesOrdered.value.slice(0, notesDisplayLimit.value);
});


const showMoreNotes = () => {
	notesDisplayLimit.value += 2; // Adjust as needed
	isExpanded.value = true;
	console.log("Show More clicked. Display limit:", notesDisplayLimit.value, "Is Expanded:", isExpanded.value);
};

const showLessNotes = () => {
	notesDisplayLimit.value = 2; // Reset to initial limit
	isExpanded.value = false;
	console.log("Show Less clicked. Display limit:", notesDisplayLimit.value, "Is Expanded:", isExpanded.value);
};


const notesOrdered = computed(() => {
	const notes = store.state.generalNotes.notesByDate || {};
	return Object.entries(notes)
		.sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
		.map(([date, note]) => ({ date, note }));
});



const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric', month: 'long', day: 'numeric'
	});
};

const fetchNotes = async () => {
	noteText.value = store.state.generalNotes.notesByDate;
};

const createNewNote = () => {
	const currentDate = new Date().toISOString().split('T')[0];
	if (!store.state.generalNotes.notesByDate[currentDate]) {
		// Create a new note entry for the current day
		store.commit('generalNotes/SET_NOTE', { date: currentDate, note: '' });
		fetchNotes(); // Fetch notes to update the UI
	} else {
		// Handle the case where a note for the current day already exists
		console.log("A note for today already exists."); // Optionally show a message or handle this case differently
	}
};

const deleteNote = (date) => {
	store.dispatch('generalNotes/deleteNote', date).then(() => {
		fetchNotes(); // Re-fetch notes to update the UI
	});
};
const saveNote = (date) => {
	const note = noteText.value[date];
	store.dispatch('generalNotes/saveNote', { date, note });
};

onMounted(() => {
	console.log("Total notes:", notesOrdered.value.length);
	console.log("Display limit:", notesDisplayLimit.value);
	console.log("notesOrdered on mounted:", notesOrdered.value);
	const currentDate = new Date().toISOString().split('T')[0];
	// Ensure there's an entry for the current day
	if (!noteText.value[currentDate]) {
		noteText.value[currentDate] = '';
	}
	fetchNotes();
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
