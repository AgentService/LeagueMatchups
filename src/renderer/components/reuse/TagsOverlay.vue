<template>
    <div class="tag-menu-container">
        <div class="note-header d-flex justify-content-start align-items-start">
            <div class="note-title">Issues</div>
        </div>
        <div class="tag-selected">
            <!-- Quadrats for selected tags -->
            <div v-for="tag in selectedTags" :key="tag.tag_id" @click.stop="toggleTag(tag.tag_id)"
                :class="['tag-quadrat', `d-flex`, `tag-${tag.tag_name.replace(/\s+/g, '')}`]">
                &nbsp;{{ tag.tag_name }}&nbsp;
                <span class="tag-close" @click.stop="toggleTag(tag.tag_id)">x</span>
            </div>

            <!-- Modal for adding tags, positioned relative to the entire tag menu container -->
            <div v-if="showAddTagView" class="add-tag-modal">
                <div v-for="tag in allTags" :key="tag.tag_id" class="tag-quadrat-selection"
                    @click="toggleTag(tag.tag_id)">
                    {{ tag.tag_name }}
                </div>
                <button @click="toggleAddTagView">Done</button>
            </div>
        </div>
        <div class="add-tag-button-container">
            <button class="btn add-tag-button" @click="toggleAddTagView">
                <i class="fas fa-plus"></i>
                <span> Add</span>
            </button>
        </div>
    </div>

</template>



<script setup>
import { computed, ref, onMounted, watchEffect } from 'vue';
import { useStore } from 'vuex';

const { noteId } = defineProps({
    noteId: {
        type: [String, Number],
        required: true
    }
});

const store = useStore();
const showAddTagView = ref(false);

const emit = defineEmits(['close']);
const closeOverlay = () => {
    emit('close');
};
const allTags = computed(() => store.getters['notes/allTags']);
const selectedTags = computed(() => {
    // First, check if the notes array exists and the specific note is found
    const note = store.state.notes?.generalNotes.find(n => n.noteId == noteId);

    // Now, check if the note has a `tags` array before calling map
    if (note && Array.isArray(note.tags)) {
        return note.tags.map(tagId => {
            const tag = store.getters['notes/allTags'].find(t => t.tag_id == tagId);
            return tag ? { tag_id: tag.tag_id, tag_name: tag.tag_name } : undefined;
        }).filter(tag => tag !== undefined);
    }

    return []; // If checks fail, return an empty array
});

const toggleTag = (tagId) => {
    const isTagSelected = selectedTags.value.some(tag => tag.tag_id === tagId);
    if (isTagSelected) {
        store.dispatch('notes/removeTagFromNote', { noteId, tagId });
    } else {
        store.dispatch('notes/addTagToNote', { noteId, tagId });
    }
};


const toggleAddTagView = () => {
    showAddTagView.value = !showAddTagView.value;
};

watchEffect(() => {
    // Whenever noteId changes, this will be run
    const note = store.getters['notes/getGeneralNoteById'](noteId);
    // perform actions based on the new note
});

onMounted(() => {
    // Fetch all tags when the component is mounted
    store.dispatch('notes/fetchTags');
});

</script>

<style scoped>
.tag-close {
    display: none;
}

.tag-quadrat:hover .tag-close {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: start;
    justify-content: center;
    color: rgba(0, 0, 0, 0.897);
    cursor: pointer;
    font-size: 10px;
    font-weight: bold;
    user-select: none;
}

.tag-CS {
    background-color: #ff4800;
}

.tag-WaveControl {
    background-color: #7FFFD4;
}

.tag-BaseTiming {
    background-color: #D8BFD8;
}

.tag-JungleTracking {
    background-color: #F0E68C;
}

.tag-SupportTracking {
    background-color: #E6E6FA;
}

.tag-Lane {
    background-color: #ADD8E6;
}

.tag-Micro {
    background-color: #F08080;
}

.tag-Teamfight {
    background-color: #90EE90;
}

.tag-ClosingGames {
    background-color: #ff58e9;
}

.tag-LeadTransition {
    background-color: #ff5866;
}

/* Base style for all tags */
.tag-quadrat {
    position: relative;
    color: black !important;
    font-size: 12px;
    border-radius: 12px;
    cursor: pointer;
    padding: 0.35rem;
    margin: 0px;
    flex: 0 0 auto;
}

.tag-menu-container {
    position: relative;
    flex-basis: 20%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 0;
}

.tag-selected {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-start;
    padding: 0.5rem;
    gap: 0.5rem;
    height: 100%;
    width: 100%;
    min-height: 70px;
}


.tag-menu {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    height: 100%;
}

.tag-quadrat {
    color: white;
}

.add-tag-modal {
    position: absolute;
    background-color: black;
    border: 1px solid #ddd;
    padding: 10px;
    z-index: 10;
}

.tag-menu-container {
    display: flex;
    align-items: flex-start;
}

.add-tag-button-container {
    margin-top: 1rem;
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

.add-tag-button {
    position: relative;
}
</style>
