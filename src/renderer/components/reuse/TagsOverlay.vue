<template>
    <div class="tag-menu-container" :class="{ 'editing': tagsEdited }">
        <div class="header justify-content-end">
            <button class="btn button tag-panel-toggle" :class="{ 'highlighted': tagsEdited }"
            @click="showAllTags ? finalizeTagEdits() : toggleTagVisibility()">
            <span v-if="showAllTags"><i class="fas fa-xmark"></i></span>
        </button>
        </div>
        <div class="tags-wrapper" :style="{ 'max-height': showAllTags ? '490px' : '100%', 'is-open': showAllTags }">
            <transition-group name="list" tag="div" class="tag-selected">
                <div v-for="tag in sortedTags" :key="tag.tag_id"
                    :class="['tag-quadrat', `tag-${tag.tag_name.replace(/\s+/g, '')}`, { 'tag-selected': isSelected(tag), 'tag-unselected': !isSelected(tag) }]"
                    @click.stop="toggleTag(tag.tag_id)">
                    &nbsp;&nbsp;{{ tag.tag_name }}&nbsp;&nbsp;
                    <span v-if="isSelected(tag)" class="tag-close" @click.stop.prevent="toggleTag(tag.tag_id)">x</span>
                </div>
            </transition-group>
        </div>
        <div class="note-footer d-flex align-items-end  justify-content-end">
            <button class="btn button tag-panel-toggle" :class="{ 'highlighted': tagsEdited }"
                @click="showAllTags ? finalizeTagEdits() : toggleTagVisibility()">
                <span v-if="showAllTags"><i class="fas fa-check"></i> Done</span>
                <span v-else><i class="fas fa-edit"></i> Show all</span>
            </button>
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
const showAllTags = ref(false);
const tagsEdited = ref(false);

const toggleTagVisibility = () => {
    showAllTags.value = !showAllTags.value;
    tagsEdited.value = true;
};

const finalizeTagEdits = () => {
    tagsEdited.value = false;
    showAllTags.value = false;
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
    return [];
});

const sortedTags = computed(() => {
    // Create a set for quick access to selected tag IDs
    const selectedTagIds = new Set(selectedTags.value.map(tag => tag.tag_id));

    // Filter out selected and unselected tags without sorting the selected ones
    const selected = allTags.value.filter(tag => selectedTagIds.has(tag.tag_id));
    const unselected = allTags.value
        .filter(tag => !selectedTagIds.has(tag.tag_id))
        .sort((a, b) => a.tag_name.localeCompare(b.tag_name, undefined, { sensitivity: 'base' }));

    // When showing all tags, concatenate the selected and sorted unselected tags
    // When not showing all tags, just return the selected ones as is
    return showAllTags.value ? [...selected, ...unselected] : selected;
});

const isSelected = (tag) => {
    if (tag && tag.hasOwnProperty('tag_id')) {
        return selectedTags.value.some(selectedTag => selectedTag.tag_id === tag.tag_id);
    }
    return false;
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
.note-footer {
    width: 100%;
	display: flex;
    flex: 1 1 auto;

}
@keyframes colorFadeAndBorder {
    0%,
    100% {
        background-color: #0021475e;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0);
    }

    50% {
        background-color: #001731;
        box-shadow: 0 0 7px rgb(0, 98, 202);
    }
}

.tag-menu-container.editing {
    border-radius: 6px;
    border: 2px dashed;
    animation: colorFadeAndBorder 4s infinite;
}

.highlighted {
    animation: pulse 3s infinite ease-in-out;
}

.list-enter-active,
.list-move {
    transition: all .5s ease;
}

.tag-panel-toggle {
    color: #fff;
    border: none;
    cursor: pointer;
    text-align: center;
}

.tags-wrapper {
    overflow: hidden;
    transition: max-height 0.5s ease-in-out;
}

.tags-wrapper::-webkit-scrollbar {
    width: 0;
}

.tags-wrapper::-webkit-scrollbar-thumb {
    background-color: darkgrey;
    border-radius: 10px;
}


.tag-close {
    position: absolute;
    font-size: 0.75rem;
    cursor: pointer;
    top: -2px;
    right: 6px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
}

.tag-quadrat:hover .tag-close {
    opacity: 1;
    visibility: visible;
}

.tag-ThreatAssessment {
    background-color: #6a1b9a;
    /* Purple */
}

.tag-ChampMastery {
    background-color: #c2185b;
    /* Pink */
}

.tag-Mental {
    background-color: #00796b;
    /* Teal */
}

.tag-Communication {
    background-color: #fbc02d;
    /* Yellow */
}

.tag-Roaming {
    background-color: #455a64;
    /* Blue Grey */
}

.tag-WardingLeaning {
    background-color: #8d6e63;
    /* Brown */
}

.tag-ObjectiveControl {
    background-color: #7b1fa2;
    /* Deep Purple */
}

.tag-Matchup {
    background-color: #0288d1;
    /* Light Blue */
}

/* Existing Styles */
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

.tag-ObjectiveControl {
    background-color: #8f003e;
}

.tag-Warding {
    background-color: #ff8a80;
}

.tag-quadrat {
    position: relative;
    color: black !important;
    font-size: 12px;
    border-radius: 12px;
    cursor: pointer;
    padding: 0.125rem .5rem;
    margin: 0.125rem;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    padding: 0.25rem;
    background-color: #000000;
    color: #ffffff !important;
    opacity: 0.75;
    text-align: center;
    justify-content: center;
    cursor: pointer;
}

.tag-menu-container {
    position: relative;
    flex-basis: 33%;
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
    padding: 0 0rem;
    border: 2px dashed transparent;
}

.tag-selected {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    padding: 0.25rem;
    gap: 0.25rem;
}


.tag-menu {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    height: 100%;
}

.tag-menu-container {
    display: flex;
    align-items: flex-start;
}
</style>
