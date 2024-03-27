<template>
	<div class="card-header-custom d-flex justify-content-between align-items-center me-3">
		<div class="d-flex">
			<span>Review Notes</span>
		</div>
		<div class="buttons-container">
			<button @click="createNewNote" class="btn add-button">
				<span>New </span>
				<i class="fas fa-plus"></i>
			</button>
		</div>
	</div>
	<div class="notes-list notes-body">
		<li v-for="item in limitedNotes" :key="item.noteId" class="note-item mb-3 me-3">
			<div class="note-content-wrapper">
				<div class="note-textarea-container">
					<div class="note-header d-flex justify-content-start align-items-start">
						<div class="note-title">Note</div>
					</div>
					<textarea spellcheck="false" v-model="noteText[item.noteId]" class="note-textarea"
						placeholder="Type your notes here..." rows="5"></textarea>
					<div class="note-footer justify-content-between align-items-center">
						<div class="note-date">{{ formatDate(item.createdAt) }}</div>
						<div class="buttons-container">
							<button @click="deleteNote(item.noteId)" class="btn button delete-button">
								<i class="far fa-trash-alt"></i>
								<span> Delete</span>
							</button>
							<button @click="saveNote(item.noteId)" class="btn save-button">
								<i class="far fa-save"></i>
								<span> Save</span>
							</button>
						</div>
					</div>
				</div>
				<div class="divider"></div>
				<TagsOverlay :noteId="item.noteId" @close="activeNoteId = null" />
			</div>
		</li>
		<div class="show-more-container">
			<button v-if="!isExpanded.value && notesOrdered.length > notesDisplayLimit" @click="showMoreNotes"
				class="btn">
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
import TagsOverlay from './reuse/TagsOverlay.vue';

const store = useStore();
const noteText = ref({});
const notesDisplayLimit = ref(3);
const isExpanded = ref(false);
const notesOrdered = computed(() => {
	return store.state.notes?.generalNotes
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// tags overlay
const activeNoteId = ref(null);
const showTagOverlay = (noteId) => {
	debugger
	activeNoteId.value = noteId;
};

const limitedNotes = computed(() => {
	return notesOrdered.value.slice(0, notesDisplayLimit.value);
});

const showMoreNotes = () => {
	notesDisplayLimit.value += 3;
	isExpanded.value = true;
	console.log("Show More clicked. Display limit:", notesDisplayLimit.value, "Is Expanded:", isExpanded.value);
};

const showLessNotes = () => {
	notesDisplayLimit.value = 3; // Reset to initial limit
	isExpanded.value = false;
	console.log("Show Less clicked. Display limit:", notesDisplayLimit.value, "Is Expanded:", isExpanded.value);
};

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
	if (!store.state.notes.generalNotes.find(note => note.date === currentDate)) {
		// Commit the new note to the Vuex state and save it to the backend
		store.dispatch('notes/createNewNote');
	} else {
		console.log("A note for today already exists.");
	}
};


const deleteNote = (noteId) => {
	store.dispatch('notes/deleteGeneralNote', noteId).then(() => {
		// Handle post-delete actions
	});
};

const saveNote = (noteId) => {
	const content = noteText.value[noteId];
	store.dispatch('notes/saveGeneralNote', { noteId, content });
};

onMounted(() => {
	fetchNotes().then(() => {
		noteText.value = {};
		for (const note of notesOrdered.value) {
			noteText.value[note.noteId] = note.content;
		}
	});
});
</script>

<style>

.buttons-container {
	text-transform: none !important;
	display: flex;
}

.save-button {
	background-color: #007bff;
}

.show-more-container {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: .5rem;
}

.show-more-button {
	margin-top: .5rem;
	color: var(--gold-2);
	border: 1px solid var(--gold-6);
}

.note-date {
	align-self: center;
	position: relative;
	padding: 0 0.25rem;
	color: var(--grey-2);
}

.note-item {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.note-content-wrapper {
	border: 1px solid var(--grey-3);
	border-radius: 4px;
	padding: 1.5rem 2rem;
	display: flex;
	height: 100%;
}

.note-textarea-container,
.tags-overlay-container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	flex-grow: 1;
}

/* Textarea container styles */
.note-textarea-container {
	position: relative;
	flex-basis: 66%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.tags-overlay-container {
	flex-basis: 33%;
}

.notes-list {
	overflow-y: auto;
	flex-grow: 1;
}

.note-textarea {
	width: 100%;
	resize: none;
}

.note-footer {
	display: flex;
	justify-content: flex-end;
	margin-top: .25rem;
}

.note-textarea-container {
	position: relative;
	width: 100%;
}

.note-header {
	margin-left: .5rem;
	margin-bottom: .5rem;
	display: flex;
	justify-content: space-between;
}

.note-title {
	font-weight: bold;
	padding: .25rem 0;
}

.divider {
	border-right: 1px solid var(--grey-3);
	margin: 1rem;
}
</style>
