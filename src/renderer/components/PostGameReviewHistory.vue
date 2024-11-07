<template>
    <div class="match-history">
        <div class="widget-header">
            <i class="fas fa-history note-icon"></i>
            <span class="widget-header-title ms-1">Review History</span>

            <span class="widget-header-right"></span>
        </div>

        <div class="refetch-button-container">
            <button @click="fetchLatestMatches(true)" class="refetch-button">Refresh Matches</button>
        </div>

        <!-- No matches found -->
        <div v-if="uiMatches.length === 0" class="no-matches">No matches found.</div>

        <!-- Display match history -->
        <div v-else class="matches-list">
            <div v-for="(match, index) in uiMatches" :key="index" class="match-card" @click="openReviewForm(match)">
                <MatchInfo :match="match" />
            </div>
        </div>

        <!-- Tooltip -->
        <div v-if="tooltip.isVisible" class="item-tooltip"
            :style="{ top: tooltipPosition.top, left: tooltipPosition.left }">
            <div class="tooltip-content">
                <div class="item-name">{{ tooltip.content.name }}</div>
                <div class="item-description">{{ tooltip.content.description }}</div>
            </div>
        </div>

        <!-- Feedback Modal -->
        <EndOfGameQuestions v-if="uiMatches" :isVisible="isModalVisible" :matchData="selectedMatch"
            :savedFeedback="selectedMatch?.feedback" @closeModal="closeModal" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import EndOfGameQuestions from './EndOfGameQuestions.vue';
import MatchInfo from './reuse/MatchInfo.vue'; // Import MatchInfo component

const store = useStore();

// Reactive state for UI
const isModalVisible = ref(false);
const selectedMatch = ref(null);
const uiMatches = ref([]); // UI data to hold match history temporarily

// Tooltip state
const tooltip = ref({
    content: null,
    itemId: null,
    isVisible: false,
});

const tooltipPosition = ref({
    top: '0px',
    left: '0px',
});

// Watch current summoner and fetch matches when it changes
const currentSummoner = computed(() => store.getters['summoner/getCurrentSummoner']);

watch(currentSummoner, async (newSummoner) => {
    if (newSummoner) {
        uiMatches.value = []; // Clear the UI temporarily
        await fetchLatestMatches(); // Fetch latest matches based on the selected summoner

        // Update `uiMatches` with the matches for the current summoner
        uiMatches.value = store.getters['matches/getMatchHistory'](newSummoner.apiResponse.puuid);
    }
});



// Open the review form for the selected match
const openReviewForm = async (match) => {
    try {
        const puuid = currentSummoner.value?.apiResponse?.puuid || currentSummoner.value?.webSocketResponse?.puuid;
        let userParticipant = match.info.participants.find(participant => participant.puuid === puuid);

        if (!userParticipant) {
            console.error("User participant not found in match data");
            return;
        }

        match.info.userParticipant = userParticipant;

        const savedFeedback = store.getters['metrics/getSubjectiveFeedbackByGameId'](match?.info?.gameId);
        selectedMatch.value = { ...match, feedback: savedFeedback?.feedback || null };
        isModalVisible.value = true;
    } catch (error) {
        console.error("Error opening review form:", error);
    }
};

// Close the modal
const closeModal = () => {
    selectedMatch.value = null;
    isModalVisible.value = false;
};

async function fetchLatestMatches(forceRefresh = false) {
    try {
        await store.dispatch("matches/fetchLastMatch", { forceRefresh: forceRefresh });

        // Update uiMatches from Vuex with the current summoner's matches
        uiMatches.value = store.getters["matches/getMatchHistory"](currentSummoner.value.apiResponse.puuid);
    } catch (error) {
        console.error("Error fetching the latest match:", error);
    }
}




// Fetch matches on component mount
onMounted(async () => {
    store.dispatch('items/fetchAllItems');

    if (currentSummoner.value) {
        await fetchLatestMatches();
        uiMatches.value = store.getters['matches/getMatchHistory'](currentSummoner.value.apiResponse.puuid);
    }
});
</script>


<style scoped>
.match-history {
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

.matches-list {
    display: flex;
    flex-direction: column;
}

.match-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    cursor: pointer;
}

.match-info:hover {
    background-color: #3a3a3a;
}

.win-background {
    background: linear-gradient(to bottom right, #122c31, #000000);
    background-color: #122c31;
}

.loss-background {
    background: linear-gradient(to bottom right, #251111, #000000);
    background-color: #2b1b1b;
}

.match-result {
    font-weight: bold;
    font-size: 1rem;
}

.match-result.win {
    color: #4CAF50;
}

.match-result.loss {
    color: #F44336;
}

.champion-icon-container {
    flex-shrink: 0;
    text-align: center;
    margin-right: 6px;
    margin-top: 4px;
}

.champion-icon {
    width: 60px;
    height: 60px;
    border-radius: 8%;
    border: 2px solid transparent;
}

.win-border {
    border-color: #4CAF50;
}

.loss-border {
    border-color: #F44336;
}

.kda {
    font-weight: 400;
}

.stats-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.details-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

}

.stats-block {
    display: flex;
    font-size: 0.8rem;
    font-weight: 400;
}

.kda,
.cs-min,
.vision-min {
    font-weight: bold;
    font-size: 0.8rem;
}



.kda-details span,
.cs-block span,
.vision-block span {
    font-size: 0.8rem;
    color: #999;
}

.kda-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 110px;
}

.cs-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 110px;
}

.vision-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100px;
}

.reviewed-badge {
    background-color: #358337;
    padding: 2px 6px;
    border-radius: 5px;
    font-size: .8rem;
    border: 1px solid #00000073;
}

.not-reviewed-badge {
    background-color: #f44336;
    padding: 2px 6px;
    border-radius: 5px;
    font-size: .8rem;
    border: 1px solid #00000073;
}

.no-matches {
    text-align: center;
    color: #bbbbbb;
}

.items-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.review-status {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
}

.item-slot {
    margin-right: 2px;
}

.item-icon {
    width: 28px;
    height: 28px;
    border: 2px solid #000000;
}

.items-row .item-slot {
    margin-left: auto;
}

.timestamp,
.game-duration {
    font-size: 0.8rem;
    color: #999;
}

.item-tooltip {
    position: fixed;
    background-color: #222;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    z-index: 1200;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    width: 200px;
    pointer-events: none;
}

.tooltip-content {
    font-size: 0.875rem;
}

.item-name {
    font-weight: bold;
    margin-bottom: 5px;
}

.item-description {
    font-size: 0.75rem;
    white-space: pre-wrap;
}

.refetch-button-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.refetch-button {
    padding: 8px 12px;
    background-color: #4CAF50;
    /* Green */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.refetch-button:hover {
    background-color: #45a049;
}
</style>