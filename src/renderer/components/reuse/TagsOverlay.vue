<template>
    <div class="tag-menu-container">
        <div class="note-header d-flex justify-content-start align-items-start">
            <div class="note-title">Tags</div>
        </div>
        <div class="tag-selected">
            <div v-for="tag in allTags" :key="tag.tag_id" :class="[
                'tag-quadrat',
                `tag-${tag.tag_name.replace(/\s+/g, '')}`,
                { 'tag-unselected': !isSelected(tag) }
            ]" @click.stop="toggleTag(tag.tag_id)">
                &nbsp;{{ tag.tag_name }}&nbsp;
                <span v-if="isSelected(tag)" class="tag-close" @click.stop="toggleTag(tag.tag_id)">x</span>
            </div>
        </div>
    </div>
</template>



<script setup>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const { noteId } = defineProps({
    noteId: {
        type: [String, Number],
        required: true
    }
});

const store = useStore();

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

const isSelected = (tag) => {
    return selectedTags.value.some(selectedTag => selectedTag.tag_id === tag.tag_id);
};

const toggleTag = (tagId) => {
    const isTagSelected = selectedTags.value.some(tag => tag.tag_id === tagId);
    if (isTagSelected) {
        store.dispatch('notes/removeTagFromNote', { noteId, tagId });
    } else {
        store.dispatch('notes/addTagToNote', { noteId, tagId });
    }
};

onMounted(() => {
    store.dispatch('notes/fetchTags');
});

</script>

<style scoped>
.tag-close {
    display: none;
}

.tag-CS {
    background-color: #ff4800;
}

.tag-WaveControl {
    background-color: #7FFFD4;
}

.tag-Recall {
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

.tag-quadrat-selection {
    color: black !important;
    font-size: 12px;
    border-radius: 12px;
    cursor: pointer;
    padding: 0.35rem;
    margin: 0px;
    flex: 0 0 auto;
    display: block;
}

/* Base style for all tags */
.tag-quadrat {
    position: relative;
    color: black !important;
    font-size: 12px;
    border-radius: 12px;
    cursor: pointer;
    padding: 0.125rem;
    margin: 0.125rem 0.125rem;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    user-select: none;

}

.tag-quadrat:hover {
    transform: scale(1.05);
}

.tag-quadrat:active {
    outline: none;
}

.tag-quadrat-clicked {
    transform: scale(0.95);
    transition: none;
}

.tag-unselected {
    background-color: #3535357a;
    color: #a8a8a85d !important;
}

.tag-menu-container {
    position: relative;
    flex-basis: 36%;
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
}

.tag-selected {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-start;
    padding: 0.5rem;
    gap: 0.5rem;
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

.tag-menu-container {
    display: flex;
    align-items: flex-start;
}
</style>
