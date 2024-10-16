<template>
    <div class="match-history">
        <div class="widget-header">
            <i class="fas fa-history note-icon"></i>
            <span class="widget-header-title ms-1">Review History</span>
            <span class="widget-header-right"></span>
        </div>
        <div class="refetch-button-container">
            <button @click="fetchLatestMatch" class="refetch-button">Refresh Matches</button>
        </div>
        <div v-if="matches?.length === 0" class="no-matches">No matches found.</div>
        <div v-else class="matches-list">
            <div v-for="(match, index) in matches" :key="index" class="match-card" @click="openReviewForm(match)">
                <!-- Use MatchInfo Component -->
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
        <EndOfGameQuestions v-if="matches" :isVisible="isModalVisible" :matchData="selectedMatch"
            :savedFeedback="selectedMatch?.feedback" @closeModal="closeModal" />
    </div>
</template>



<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import EndOfGameQuestions from "./EndOfGameQuestions.vue";
import MatchInfo from './reuse/MatchInfo.vue'; // Import MatchInfo component

const store = useStore();
const isModalVisible = ref(false);
const selectedMatch = ref(null);

// Tooltip state
const tooltip = ref({
    content: null,
    itemId: null,
    isVisible: false,
});

const matches = computed(() => store.getters['matches/getMatchHistory']);

const tooltipPosition = ref({
    top: '0px',
    left: '0px',
});


const openReviewForm = async (match) => {
    try {
        // Ensure match and gameId exist
        if (!match || !match?.info?.gameId) {
            console.warn("Invalid match data provided");
            return;
        }

        // Ensure match data exists
        if (!match?.info?.participants) {
            console.warn("No participants data in match!");
            return;
        }

        const puuid = store.state.summoner.playerDetails[0]?.puuid;
        let userParticipant = match.info.participants.find(
            (participant) => participant.puuid === puuid
        );

        // If PUUID lookup fails, try matching by summoner name
        if (!userParticipant) {
            const summonerName = store.state.summoner.playerDetails[0]?.gameName;
            const participantIdentity = match.info.participantIdentities?.find(
                (identity) => identity.player.summonerName === summonerName
            );

            if (participantIdentity) {
                const participantId = participantIdentity.participantId;
                userParticipant = match.info.participants.find(
                    (participant) => participant.participantId === participantId
                );
            }
        }

        // If the user participant is found, proceed
        if (userParticipant) {
            // Assign userParticipant to match info
            match.info.userParticipant = userParticipant;

            // Fetch previously saved feedback for this match
            const savedFeedback = store.getters['metrics/getSubjectiveFeedbackByGameId'](match?.info?.gameId);

            // Update the selected match with feedback if available
            selectedMatch.value = {
                ...match,
                feedback: savedFeedback?.feedback || null,
            };

            // Open the modal
            isModalVisible.value = true;
        } else {
            console.error("User participant not found in match data");
        }
    } catch (error) {
        console.error("Error opening review form:", error);
    }
};

const closeModal = () => {
    selectedMatch.value = null;
    isModalVisible.value = false;
};

async function fetchLatestMatch() {
    try {
        const puuid = store.state.summoner.playerDetails[0]?.puuid;
        if (!puuid) {
            console.error("Player PUUID is not available.");
            return;
        }
        // Fetch the latest match data using a Vuex action
        await store.dispatch("matches/fetchLastMatch", puuid);

        // Get the latest match from the Vuex store
        const recentMatches = store.getters["matches/getMatchHistory"];
        console.log("Fetched Matches:", recentMatches);

        const latestMatch = recentMatches[0];
        if (!latestMatch) {
            console.error("No match data found.");
            return;
        }
        console.log("Latest Match Data:", latestMatch);
    } catch (error) {
        console.error("Error fetching the latest match:", error);
    }
}

onMounted(() => {
    store.dispatch('items/fetchAllItems');
    // fetchAndShowLastMatch();
});
</script>


<style scoped>
.match-history {
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 0 0 12px 12px;
    padding: 1rem 1rem;
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