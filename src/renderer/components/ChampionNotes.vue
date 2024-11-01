<template>
	<div class="notes-container">
		<!-- Custom Header -->
		<div class="widget-header">
			<i class="fas fa-sticky-note note-icon"></i>
			<span class="widget-header-title ms-1">Champion Notes</span>
		</div>

		<!-- Editor and Status Message -->
		<EditorMenuBar :editor="editor" />
		<div class="editor-wrapper">
			<editor-content :editor="editor" class="editor-content" :class="[borderColorClass]" />
		</div>
		<div class="editor-footer-bar">
			<div class="left-status">
				<!-- Status Messages -->
				<span v-if="notesState === 'unsaved'" :class="[buttonTextColorClass]">
					<i class="fas fa-exclamation-triangle text-warning"></i> Unsaved
				</span>
				<span v-else-if="notesState === 'saved'" :class="[buttonTextColorClass]">
					<i class="fas fa-check-circle text-success"></i> Saved
				</span>
				<span v-else-if="notesState === 'neutral'">
					<i class="fas fa-check-circle text-muted"></i>
				</span>
			</div>
			<div class="right-status">
				<!-- Save Button -->
				<button @click="manualSave" :class="['btn', 'button', buttonTextColorClass]">
					<i class="fas fa-save"></i> Save
				</button>
			</div>
		</div>
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
		notesState.value = 'unsaved';
		// debouncedSave(editor.getHTML());
	},
});

// Ensure editor cleanup
onBeforeUnmount(() => {
	if (editor.value) {
		editor.value.destroy();
	}
});

let saveTimeout = null;

// Computed property for button text color
const buttonTextColorClass = computed(() => {
	switch (notesState.value) {
		case 'unsaved':
			return 'text-warning';
		case 'saved':
			return 'text-success';
		default:
			return 'text-muted';
	}
});

// Computed property for border color class
const borderColorClass = computed(() => {
	switch (notesState.value) {
		case 'unsaved':
			return 'border-warning';
		case 'saved':
			return 'border-success';
		default:
			return 'border-muted';
	}
});


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
		}, 1000);
	}, 1000); // Save 1 second after the last keystroke
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

// Manual save function triggered by the save button
async function manualSave() {
	const content = editor.value?.getHTML();
	await saveChampionNotes(content);
	notesState.value = 'saved';
	setTimeout(() => {
		notesState.value = 'neutral'; // Reset to 'neutral' after some time
	}, 1000);
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
.champion-matchup-icon {
	width: 50px;
	height: auto;
	background: var(--hextech-black);
	border: 0px solid var(--blue-7);
}

.notes-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	position: relative;
	width: 100%;
	background: #091014;
	border-radius: 0 0 12px 12px;
	padding: 2rem 2rem;
	padding-bottom: 1.5rem;
	border: 1px solid rgba(128, 128, 128, 0.1);
	color: var(--gold-1);
}

.editor-wrapper {
	flex: 1;
	display: flex;
	overflow: hidden;
	border-radius: 8px;
	/* Leave space for footer */
	width: 100%;
}

.editor-content {
	flex: 1;
	width: 100%;
	/* Ensure it takes full width */
	min-height: 335px;
	max-height: 335px;
	border: 1px solid;
	margin: 2px;
	border-radius: 8px;
	transition: border-color 0.3s ease;
	padding: .5rem;
}

.editor-content:focus {
	/* Highlighted border color */
}

.ProseMirror {
	flex: 1;
	width: 100%;
	/* Ensure it takes full width */
	min-height: 322px;
	/* Minimum height to prevent shrinking */
	max-height: 322px;
	overflow-y: auto;
	box-sizing: border-box;
	outline: none;
	border-radius: 12px;
	padding: .5rem;
	font-size: 0.9rem;
	font-weight: 400;
	background: linear-gradient(to right, #091014, #060c11a8);
	transition: border-color 0.3s ease;
	/* Smooth transition for border color */
}

.ProseMirror:focus-within {
	border-color: #ffffff;
	/* Highlight border color when focused */
}

.editor-footer-bar {
	display: flex;
	justify-content: space-between;
	padding-left: 10px;
	font-size: 0.9rem;
	position: relative;
	right: 0;
	border-radius: 12px;
	left: 0;
	bottom: 0;
}

.left-status,
.right-status {
	display: flex;
	align-items: center;
}

/* Specific rule to remove margin from <p> inside <li> */
.ProseMirror ul li p {
	margin-bottom: 0 !important;
}

.text-warning {
	color: #ffc107 !important;
}

.text-success {
	color: #28a745 !important;
}

.text-muted {
	color: #6c757d !important;
}

.border-warning {
	border-color: #ffc107 !important;
}

.border-success {
	border-color: #28a745 !important;
}

.border-muted {
	border-color: #6c757d2c !important;
}
</style>
