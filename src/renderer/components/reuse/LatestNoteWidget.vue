<template>
    <div class="latest-note-widget" @click="goToJournalPage">
        <div v-if="latestNote">
            <div class="widget-header">
                <i class="far fa-calendar-alt note-date-icon"></i>
                <span class="widget-header-title ms-1">Last Note</span>
                <span class="widget-header-right">{{ formatDate(latestNote.createdAt) }}</span>
            </div>
            <div class="content-container">
                <div class="note-content">
                    <div class="note-preview">{{ truncate(latestNote.content, 100) }}</div>
                </div>
                <div class="tags-container">
                    <div v-for="tag in latestNoteTags" :key="tag.tag_id" class="tag-quadrat"
                        :class="`tag-${tag.tag_name.replace(/\s+/g, '')}`">
                        {{ tag.tag_name }}
                    </div>

                </div>
            </div>
            <div class="widget-footer">
                <i class="fas fa-arrow-right"></i>
            </div>
        </div>
        <div v-else class="no-notes">
            <i class="far fa-sticky-note"></i>
        </div>
    </div>
</template>


<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();
const allTags = computed(() => store.getters['notes/allTags']);

const notesOrdered = computed(() => {
    return store.state.notes?.generalNotes
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const latestNote = computed(() => notesOrdered.value[0]);

const latestNoteTags = computed(() => {
    // Assuming latestNote is already defined and has a tags array
    if (!latestNote.value || !latestNote.value.tags) {
        return [];
    }
    return latestNote.value.tags.map(tagId => {
        const tag = allTags.value.find(t => t.tag_id === tagId);
        return tag ? { tag_id: tag.tag_id, tag_name: tag.tag_name } : undefined;
    }).filter(tag => tag !== undefined);
});

// Add this to your <script setup> section
const truncate = (text, length = 80) => {
    if (!text) return ''; // Make sure there's text to truncate
    if (text.length <= length) return text;
    return text.substring(0, length) + '…'; // Use an ellipsis character
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

const goToJournalPage = () => {
    router.push({ path: '/JournalPage' });
};

onMounted(() => {
    store.dispatch('notes/fetchGeneralNotes');
    store.dispatch('notes/fetchTags');
});
</script>

<style scoped>
.note-preview {
    flex: 1;
    font-size: 0.9rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 7;
    -webkit-box-orient: vertical;
    padding: .5rem .0rem;
    font-weight: 400;
}

.latest-note-widget {
    display: flex;
    max-height: 290px;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
}

.latest-note-widget:hover {
    transform: translateY(-2px);
    /* Slight lift effect on hover */
}

/* Tooltip CSS */
.latest-note-widget::after {
    content: "Click to view Journal";
    visibility: hidden;
    opacity: 0;
    width: 160px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 50%;
    margin-left: -80px;
    transition: opacity 0.3s, visibility 0.3s;
    border: 1px solid #333;
}

.latest-note-widget:hover::after {
    visibility: visible;
    opacity: 1;
}



.note-date-icon {
    font-size: .875rem;
}

.note-textarea-container {
    display: block;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.tag-quadrat {
    color: black;
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    line-height: 1;
    position: relative;
    border-radius: 12px;
    cursor: pointer;
    user-select: none;
    opacity: 0.55;
    text-align: center;
    flex: 1 1 auto;
}

.no-notes {
    font-size: 0.95rem;
    color: #ccc;
    padding: 1rem 0;
}
</style>
