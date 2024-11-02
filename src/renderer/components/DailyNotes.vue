<template>
	<div class="space-y-4 bg-custom-dark text-white p-4 rounded-lg shadow-lg">
		<!-- Header Section with Title and New Note Button -->
		<div class="flex justify-between items-center pb-1 border-b border-gray-300">
			<span class="font-semibold text-lg">Daily Notes</span>
			<button @click="createNewNote"
				class="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-3 py-2 rounded-md">
				<i class="fas fa-plus"></i>
				<span>New</span>
			</button>
		</div>

		<!-- Notes List Section -->
		<ul class="space-y-3">
			<li v-for="item in limitedNotes" :key="item.noteId"
				class="p-3 bg-gray-800 rounded-lg flex items-start space-x-4">
				<!-- Note Content -->
				<div class="flex-1 flex flex-col">
					<div class="flex justify-between items-center mb-2">
						<div class="font-semibold text-sm text-gray-400">{{ formatDate(item.createdAt) }}</div>
					</div>
					<!-- Note Textarea -->
					<textarea spellcheck="false" v-model="getNoteContent(item.noteId).content"
						@input="markAsUnsaved(item.noteId)" class="note-textarea"
						placeholder="Type your notes here..."></textarea>

					<div class="flex justify-end space-x-2 mt-2">
						<button @click="deleteNote(item.noteId)"
							class="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition">
							<i class="far fa-trash-alt"></i>
							<span>Delete</span>
						</button>
						<button @click="saveNote(item.noteId)" :class="[
							'flex items-center space-x-1 font-semibold px-3 py-1 rounded-md transition',
							noteText[item.noteId]?.unsaved ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
						]" :disabled="!noteText[item.noteId]?.unsaved">
							<i class="far fa-save"></i>
							<span>Save</span>
						</button>
					</div>
				</div>

				<!-- Tags Overlay -->
				<div class="w-1/3 max-w-xs">
					<TagsOverlay :noteId="item.noteId" @close="activeNoteId = null" />
				</div>
			</li>
		</ul>

		<!-- Show More / Show Less Button -->
		<div class="flex justify-center mt-4">
			<button v-if="!isExpanded && notesOrdered.length > notesDisplayLimit" @click="showMoreNotes"
				class="text-yellow-500 hover:text-yellow-400 font-semibold">
				Show More
			</button>
			<button v-else @click="showLessNotes" class="text-yellow-500 hover:text-yellow-400 font-semibold">
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
const notesDisplayLimit = ref(5);
const isExpanded = ref(false);

const activeNoteId = ref(null);
const notesOrdered = computed(() => {
	return store.state.notes?.generalNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const limitedNotes = computed(() => notesOrdered.value.slice(0, notesDisplayLimit.value));

// Helper method to ensure note content is initialized
const getNoteContent = (noteId) => {
	if (!noteText.value[noteId]) {
		noteText.value[noteId] = { content: '', unsaved: false };
	}
	return noteText.value[noteId];
};

// Fetch notes from Vuex store and initialize noteText
const fetchNotes = async () => {
	await store.dispatch('notes/fetchGeneralNotes');
	noteText.value = {}; // Clear existing data
	for (const note of notesOrdered.value) {
		noteText.value[note.noteId] = {
			content: note.content || '', // Initialize content
			unsaved: false // Set unsaved to false initially
		};
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

const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric', month: 'long', day: 'numeric'
	});
};

// Mark a note as unsaved when edited
const markAsUnsaved = (noteId) => {
	if (noteText.value[noteId]) {
		noteText.value[noteId].unsaved = true;
	}
};

// Save a note by ID and reset unsaved flag
const saveNote = (noteId) => {
	const content = noteText.value[noteId].content;
	store.dispatch('notes/saveGeneralNote', { noteId, content }).then(() => {
		noteText.value[noteId].unsaved = false; // Mark as saved
	});
};

onMounted(() => {
	store.dispatch('summoner/deduplicatePlayerDetails');

	fetchNotes();
});


</script>


<style scoped>
/* Container Styling */
.notes-container ul {
	list-style-type: disc;
	padding-left: 1.5rem;
}

/* Textarea Styling */
.note-textarea {
	width: 100%;
	min-height: 150px;
	/* Adjust this value to increase min-height */
	height: 100%;
	resize: none;
	padding: 0.75rem;
	background-color: #1e2328;
	color: #f0e6d2;
	border: 1px solid #4a5568;
	border-radius: 0.375rem;
	font-size: 1rem;
	outline: none;
	transition: border-color 0.3s ease;
	flex-grow: 1;
}

/* Focus Effect */
.note-textarea:focus {
	border-color: #fcd34d;
	box-shadow: 0 0 0 2px rgba(252, 211, 77, 0.5);
}

.flex-1 {
	display: flex;
	flex-direction: column;
}

textarea:focus {
	outline: none;
	box-shadow: 0 0 0 2px rgba(252, 211, 77, 0.5);
}
</style>
