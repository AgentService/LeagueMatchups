<template>
    <div class="feedback-widget">
        <div class="feedback-body">
            <!-- Overall Performance -->
            <div class="feedback-row">
                <i class="fas fa-star feedback-icon"></i>
                <span class="feedback-value">{{ feedback?.feedback?.overallPerformance }}</span>
            </div>
            <!-- Focus, Tilt -->
            <div class="feedback-row">
                <div class="feedback-item">
                    <i class="fas fa-bullseye feedback-icon"></i>
                    <span class="feedback-value">{{ feedback?.feedback?.focusLevel }}</span>
                </div>
                <div class="feedback-item">
                    <i class="fas fa-frown feedback-icon"></i>
                    <span class="feedback-value">{{ feedback?.feedback.tiltLevel }}</span>
                </div>
            </div>
            <!-- Emotions -->
            <div class="feedback-row">
                <i class="fas fa-heart feedback-icon"></i>
                <span class="feedback-value">{{ feedback?.feedback?.emotions?.join(", ") }}</span>
            </div>
            <!-- Main Issues -->
            <div class="feedback-row">
                <i class="fas fa-exclamation-circle feedback-icon"></i>
                <span class="feedback-value">{{ feedback?.feedback?.mainIssues?.join(", ") }}</span>
            </div>
        </div>
        <a :href="getGameLink(feedback?.gameId)" target="_blank" class="details-link">
            <i class="fas fa-link"></i> Details
        </a>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const feedback = computed(() => store.getters["metrics/getSubjectiveFeedbackByGameId"](props.gameId)) || {};

const props = defineProps({
    gameId: {
        type: String,
        required: true
    }
});

function getGameLink(gameId) {
    return `https://blitz.gg/lol/match/euw1/Azateq-MLA/${gameId}`; // Use the appropriate link for the game details
}
</script>


<style scoped>
.feedback-widget {
    padding: .5rem;
    width: 300px;
    height: 135px;
    display: flex;
    flex-direction: column;
    background-color: #0c151a;
    transition: transform 0.2s, box-shadow 0.2s;
}

.feedback-widget:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.feedback-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
}

.feedback-row {
    display: flex;
    align-items: center;
    gap: 4px;
}

.feedback-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.feedback-icon {
    font-size: 1rem;
    color: #ff9800;
    /* More visually appealing color for icons */
}

.feedback-value {
    color: #e0e0e0;
    /* Softer text color for readability */
    font-size: 0.85rem;
}

.details-link {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #ff9800;
    font-size: 0.75rem;
    text-decoration: none;
    gap: 4px;
    margin-top: auto;
}

.details-link:hover {
    text-decoration: underline;
}

.details-link i {
    font-size: 0.85rem;
}

.reviewed-badge,
.not-reviewed-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #358337;
    color: #fff;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: background-color 0.2s;
}

.not-reviewed-badge {
    background-color: #f44336;
}

.reviewed-badge:hover,
.not-reviewed-badge:hover {
    background-color: #2c7a2e;
}

.not-reviewed-badge:hover {
    background-color: #c0392b;
}
</style>
