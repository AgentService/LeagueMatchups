<template>
	<div class="notes-container">
		<!-- Custom Header -->

		<!-- Editor and Status Message -->
		<!-- Editor and Status Message -->
		<EditorMenuBar :editor="editor" />
		<div class="editor-wrapper">
			<editor-content :editor="editor" class="editor-content" />
		</div>
		<div class="status-container">
			<div v-if="notesState === 'editing'" key="editing" class="status-message">
				<i class="fas fa-edit text-warning"></i> Editing...
			</div>
			<div v-if="notesState === 'saved'" key="saved" class="status-message">
				<i class="fas fa-check text-success"></i> Saved!
			</div>
		</div>

		<!-- Shared Notes Modal -->
		<SharedNotesModal ref="NotesSharedModalRef" :isVisible="showNotesModal" notesType="champion"
			title="Shared Champion Notes" :champion="championA" @update:isVisible="showNotesModal = $event" />
	</div>
</template>


<script setup>
import { ref, onBeforeUnmount, onMounted, watch, computed } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import EditorMenuBar from './EditorMenuBar.vue';
import { useStore } from 'vuex';
import SharedNotesModal from './reuse/NotesShareModal.vue';

// Initialize Vuex store
const store = useStore();
const championA = computed(() => store.getters['matchups/getChampionA']);
const championId = ref('');
const notesState = ref('neutral');
const showNotesModal = ref(false);
const NotesSharedModalRef = ref(null);

// Editor setup
const editor = useEditor({
	extensions: [
		StarterKit,
		Underline,
		Link.configure({
			openOnClick: false,
		}),
	],
	content: '', // Initial empty content, will be set after fetching
	editorProps: {
		attributes: {
			class: 'ProseMirror',
			spellcheck: 'false',       // Disable spellcheck
			autocorrect: 'off',        // Disable autocorrect
			autocapitalize: 'off',     // Disable autocapitalize
			'data-gramm': 'false',     // Disable Grammarly
		},
	},
	onUpdate: ({ editor }) => {
		notesState.value = 'editing';
		debouncedSave(editor.getHTML());
	},
});

// Ensure editor cleanup
onBeforeUnmount(() => {
	if (editor.value) {
		editor.value.destroy();
	}
});

let saveTimeout = null;

// Fetch notes for the current champion
async function fetchAndSetNotes(currentChampionId) {
	await store.dispatch('notes/fetchChampionPersonalNotes', currentChampionId);
	const fetchedNotes = store.getters['notes/getChampionPersonalNotes'](
		currentChampionId
	);
	editor.value?.commands.setContent(fetchedNotes || '<p>Start typing...</p>');
}

// Debounced save function to prevent excessive API calls
function debouncedSave(content) {
	if (saveTimeout) clearTimeout(saveTimeout);
	saveTimeout = setTimeout(async () => {
		await saveChampionNotes(content);
		notesState.value = 'saved'; // Update state to 'saved' after successful save
		setTimeout(() => {
			notesState.value = 'neutral'; // Reset to 'neutral' after some time
		}, 2000);
	}, 2000); // Save 1 second after the last keystroke
}

// Save champion notes
async function saveChampionNotes(content) {
	try {
		await store.dispatch('notes/updateChampionPersonalNotes', {
			championName: championId.value,
			content,
		});
	} catch (error) {
		console.error('Error saving notes:', error);
	}
}

watch(championA, async (newChampionA) => {
	if (newChampionA && newChampionA.id !== championId.value) {
		championId.value = newChampionA.id;
		await fetchAndSetNotes(championId.value); // Fetch and set notes for the new champion
	}
}, { immediate: true });

// Fetch other users' notes when the modal is opened
watch(showNotesModal, (newVal) => {
	if (newVal === true) {
		fetchOtherUsersNotes();
	}
});

async function fetchOtherUsersNotes() {
	await store.dispatch('notes/fetchOtherUsersChampionNotes', championId.value);
	NotesSharedModalRef.value?.fetchData(championId.value);
}

// Fetch notes on component mount
onMounted(async () => {
	if (championA.value && championA.value.id) {
		championId.value = championA.value.id;
		await fetchAndSetNotes(championId.value);
	}
});
</script>

<style>
.editor-wrapper {
	flex: 1;
	display: flex;
	overflow: hidden;
	border-radius: 8px;
}

.ProseMirror {
	flex: 1;
	min-height: 360px;
	max-height: 360px;
	overflow-y: auto;
	box-sizing: border-box;
	outline: none;
	border: 1px solid #dddddd15;
	border-radius: 8px;
	padding: 12px 14px;
	font-size: 0.9rem;
	font-weight: 400;
	background: linear-gradient(to right, #091014, #060c11a8);
}

.ProseMirror:focus {
	border: 1px solid #dddddd98;
}

/* Specific rule to remove margin from <p> inside <li> */
.ProseMirror ul li p {
	margin-bottom: 0 !important;
	/* Ensure no margin-bottom */
}

.notes-container {
	display: flex;
	position: relative;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;
}

.header-actions {
	display: flex;
	align-items: center;
}

.editor-wrapper {
	flex: 1;
	overflow: hidden;
	border-radius: 4px;
	margin-bottom: .5rem;
	padding: 5px;
	display: flex;
	flex-direction: column;
}

.menu-bar {
	margin-bottom: 10px;
}

.menu-bar button {
	margin-right: 5px;
	padding: 5px 10px;
	border: none;
	background-color: transparent;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.3s ease;
}

.menu-bar button.is-active {
	color: #007bff;
}

.menu-bar button:hover {
	background-color: rgba(0, 123, 255, 0.1);
}

.menu-bar i {
	font-size: 16px;
}

.share-button {
	text-align: right;
}

.status-container {
	position: absolute;
	text-align: right;
	bottom: 0;
	right: 18px;
	font-size: 0.8rem;
	font-weight: 400;
}
</style>
