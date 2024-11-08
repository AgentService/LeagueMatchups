<template>
    <div v-if="isVisible && localMatchData" class="modal-overlay" role="dialog" aria-modal="true"
        aria-labelledby="step-title">
        <div class="questionnaire-modal">
            <!-- Close Button -->
            <button class="close-button" @click="closeModal" aria-label="Close Modal">✖</button>
            <div class="modal-title">Post-Match Review</div>

            <!-- Include MatchInfo Component -->
            <div v-if="localMatchData" class="match-card">
                <MatchInfo v-if="localMatchData" :match="localMatchData" />
            </div>

            <!-- Step Content -->
            <div class="step-content">
                <transition name="modal-transition" mode="out-in">
                    <!-- Step 1: Select Main Issues -->
                    <!-- Step 1: Select Main Issues -->
                    <div v-if="currentStep === 0" key="step-0" class="step-container">
                        <div class="step-title">Main Issues</div>

                        <div class="issue-options">
                            <div v-for="mainIssue in mainIssues" :key="mainIssue.id" @click="toggleIssue(mainIssue.id)"
                                :class="{ selected: feedback.mainIssues.includes(mainIssue.id) }" class="issue-card">
                                <i :class="mainIssue.iconClass" class="issue-icon"></i>
                                <span>{{ mainIssue.label }}</span>
                            </div>
                        </div>
                    </div>


                    <!-- Step 2: Select Sub-Issues -->
                    <div v-else-if="currentStep === 1" key="step-1" class="step-container">
                        <div class="step-title">Specific Issues</div>

                        <div v-for="mainIssueId in feedback.mainIssues" :key="mainIssueId" class="sub-issue-group">
                            <div class="sub-issue-title">
                                <i :class="getMainIssueIcon(mainIssueId)"></i>
                                <span>{{ getMainIssueLabel(mainIssueId) }}</span>
                            </div>

                            <div class="sub-issue-options">
                                <div v-for="subIssue in getSubIssues(mainIssueId)" :key="subIssue.id"
                                    @click="toggleSubIssue(subIssue.id)"
                                    :class="{ selected: feedback.subIssues.includes(subIssue.id) }"
                                    class="sub-issue-card">
                                    <i :class="subIssue.iconClass" class="sub-issue-icon"></i>
                                    <span>{{ subIssue.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>



                    <!-- Step 3: Additional Comments -->
                    <div v-else-if="currentStep === 2" key="step-2" class="step-container">
                        <div class="step-title">Any Additional Comments?</div>
                        <textarea v-model="feedback.comments"
                            placeholder="Add any additional feedback here..."></textarea>
                    </div>

                    <!-- Step 4: Review and Submit -->
                    <!-- <div v-else-if="currentStep === 2" key="step-3" class="step-container">
                        <div class="step-title">Summary</div>

                        <div class="summary-options">
                            <div class="summary-card">
                                <div class="summary-section">
                                    <strong>Main Issues:</strong>
                                    <span>{{ feedback.mainIssues.map(getMainIssueLabel).join(', ') }}</span>
                                </div>
                                <div class="summary-section">
                                    <strong>Sub-Issues:</strong>
                                    <span>{{ feedback.subIssues.map(getSubIssueLabel).join(', ') }}</span>
                                </div>
                            </div>
                        </div>
                    </div> -->

                </transition>
            </div>

            <!-- Step Indicator with Progress Bar -->
            <div class="step-indicator">
                <div class="progress-bar">
                    <!-- Correct progress bar calculation -->
                    <div class="progress" :style="{ width: ((currentStep + 1) / (maxStep + 1)) * 100 + '%' }"></div>
                </div>
                <div class="step-labels">
                    <!-- Correct step label classes -->
                    <span :class="{ active: currentStep === 0, completed: currentStep > 0 }">Main Issues</span>
                    <span :class="{ active: currentStep === 1, completed: currentStep > 1 }">Specific Issues</span>
                    <span :class="{ active: currentStep === 2, completed: currentStep > 2 }">Comments</span>
                </div>
            </div>


            <!-- In your template section of EndOfGameQuestions.vue -->

            <div class="navigation-buttons">
                <!-- Back Button -->
                <button @click="prevStep" v-if="currentStep > 0">Back</button>

                <!-- Next/Submit Button with Tooltip -->
                <div class="tooltip-wrapper">
                    <button @click="currentStep < maxStep ? nextStep() : submitFeedback()" class="next-button"
                        :disabled="!canProceed || (currentStep === maxStep && !hasChanges)">
                        {{ currentStep < maxStep ? 'Next' : 'Submit' }} </button>

                            <!-- Tooltip for sub-issue validation (if canProceed is false) -->
                            <span v-if="!canProceed" class="tooltip-text">
                                Please select at least one sub-issue for each main issue.
                            </span>

                            <!-- Tooltip for no changes detected (if on the last step and no changes) -->
                            <span v-if="currentStep === maxStep && !hasChanges" class="tooltip-text">
                                No changes made to the feedback.
                            </span>
                </div>
            </div>


        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useStore } from "vuex";
import MatchInfo from './reuse/MatchInfo.vue'; // Import MatchInfo component
import { mainIssues, subIssuesMap } from '../../constants/feedbackQuestions.js'; // Import questions

const store = useStore();
const isVisible = ref(false);
const currentStep = ref(0);
const maxStep = 2;

// Feedback object
const feedback = ref({
    mainIssues: [],
    subIssues: [],
    comments: '',
});

// Props and Emit setup
const props = defineProps({
    isVisible: Boolean,
    matchData: {
        type: Object,
        required: false,
        default: () => ({})
    },
    savedFeedback: Object
});

const initialFeedback = ref(null); // Store the original feedback for comparison
const hasChanges = computed(() => {
    return JSON.stringify(feedback.value) !== initialFeedback.value;
});

// Prepopulate feedback when savedFeedback changes
watch(
    () => props.savedFeedback,
    (newFeedback) => {
        if (newFeedback) {
            feedback.value = {
                mainIssues: newFeedback.mainIssues || [],
                subIssues: newFeedback.subIssues || [],
                comments: newFeedback.comments || '',
            };
            initialFeedback.value = JSON.stringify(feedback.value); // Save initial feedback state
        }
    },
    { immediate: true }
);

const emit = defineEmits(['closeModal']);

function getMainIssueIcon(mainIssueId) {
    const issue = mainIssues.find(issue => issue.id === mainIssueId);
    return issue ? issue.iconClass : 'fas fa-exclamation-circle';
}

// Toggle Functions
function toggleIssue(issueId) {
    const index = feedback.value.mainIssues.indexOf(issueId);
    if (index > -1) {
        feedback.value.mainIssues.splice(index, 1);
        // Remove related sub-issues
        feedback.value.subIssues = feedback.value.subIssues.filter(
            (subId) => !subIssuesMap[issueId]?.some((sub) => sub.id === subId)
        );
    } else {
        feedback.value.mainIssues.push(issueId);
    }
}

function toggleSubIssue(subIssueId) {
    const index = feedback.value.subIssues.indexOf(subIssueId);
    if (index > -1) {
        feedback.value.subIssues.splice(index, 1);
    } else {
        feedback.value.subIssues.push(subIssueId);
    }
}

// Label Getters
function getMainIssueLabel(issueId) {
    const issue = mainIssues.find((issue) => issue.id === issueId);
    return issue ? issue.label : '';
}

function getSubIssues(mainIssueId) {
    const subIssues = subIssuesMap[mainIssueId] || [];
    return subIssues.filter(subIssue => subIssue && subIssue.id && subIssue.label);
}

const canProceed = computed(() => {
    if (currentStep.value === 0) {
        return feedback.value.mainIssues.length > 0;
    } else if (currentStep.value === 1) {
        // Check if each selected main issue has at least one sub-issue selected
        return feedback.value.mainIssues.every(mainIssueId =>
            subIssuesMap[mainIssueId] && feedback.value.subIssues.some(subId =>
                subIssuesMap[mainIssueId].some(subIssue => subIssue.id === subId)
            )
        );
    } else {
        return true;
    }
});

function nextStep() {
    if (currentStep.value < maxStep && canProceed.value) {
        currentStep.value++;
    }
}

function prevStep() {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
}
function submitFeedback() {
    const matchInfo = localMatchData.value.info || localMatchData.value;

    // Get the current summoner's information from the Vuex store
    const currentSummoner = store.getters['summoner/getCurrentSummoner'];

    if (!currentSummoner) {
        console.error('No current summoner selected.');
        return;
    }

    let userParticipant = null;

    // Try finding the user participant using the current summoner's PUUID (preferred method)
    const puuid = currentSummoner.apiResponse?.puuid || currentSummoner.webSocketResponse?.puuid;

    if (puuid) {
        userParticipant = matchInfo.participants?.find((p) => p.puuid === puuid);
    }

    // If PUUID-based search fails, try finding the user by their summoner name
    if (!userParticipant && matchInfo.participantIdentities) {
        const gameName = currentSummoner.apiResponse?.gameName || currentSummoner.webSocketResponse?.gameName;

        const identity = matchInfo.participantIdentities.find(
            (pi) => pi.player.gameName === gameName
        );
        if (identity) {
            const participantId = identity.participantId;
            userParticipant = matchInfo.participants?.find(p => p.participantId === participantId);
        }
    }

    if (!userParticipant) {
        console.error('User participant not found.');
        return;
    }

    // Once we have the userParticipant, proceed with the feedback submission
    const feedbackEntry = {
        gameId: matchInfo.gameId,
        timestamp: new Date().toISOString(),
        gameMode: matchInfo.gameMode,
        gameType: matchInfo.gameType,
        championPlayed: getChampionName(userParticipant.championId),
        gameDuration: matchInfo.gameDuration,
        win: isWin(matchInfo, userParticipant),
        feedback: feedback.value,
    };

    store.dispatch('metrics/addOrUpdateSubjectiveFeedback', feedbackEntry);
    store.dispatch('matches/addReviewedMatch', {
        gameId: feedbackEntry.gameId,
        reviewed: true,
    });

    // Reset and close modal
    feedback.value = { mainIssues: [], subIssues: [], comments: '' };
    currentStep.value = 0;
    isVisible.value = false;
    emit('closeModal');
}


// Helper function to determine if the player won or lost
function isWin(match, userParticipant) {
    return userParticipant?.stats?.win ?? false;
}

// Get Champion Name
function getChampionName(championId) {
    const champions = store.getters['champions/getChampionDetails'];
    const champion = Object.values(champions).find(c => c.key === String(championId));
    return champion ? champion.name : 'Unknown Champion';
}

// Close Modal
function closeModal() {
    isVisible.value = false;
    emit('closeModal');
}

// Modal State
const localMatchData = ref(null);

// WebSocket Handling
function handlePostGameStats(data) {
    if (data) {
        const normalizedData = data.info ? data : { info: data };
        setUserParticipant(normalizedData);
        isVisible.value = true; // Open the modal
    }
}

function handleGameStart() {
    closeModal();
}


onMounted(() => {
    const cleanupGameStart = window.ws.receive('game-start-event', handleGameStart);
    // const cleanupGameEnd = window.ws.receive('game-end-event', async () => {
    //     await store.dispatch('matches/fetchLastMatch', { forceRefresh: true, count: 1 });
    // });
    onUnmounted(() => {
        // cleanupPostGameStats();
        cleanupGameStart();
        // cleanupGameEnd(); // Clean up the listener when the component is destroyed
    });
});

// Normalize match data and set user participant
function setUserParticipant(matchData) {
    // Normalize the data structure to always have `info` and `participants`
    const normalizedMatchData = matchData.info ? matchData : { info: matchData };
    const puuid = store.state.summoner.playerDetails[0]?.puuid;

    // Find the user participant
    const userParticipant = normalizedMatchData.info.participants?.find(
        (participant) => participant.puuid === puuid
    );

    if (userParticipant) {
        normalizedMatchData.info.userParticipant = userParticipant;
    }

    // Set the normalized data in the ref
    localMatchData.value = normalizedMatchData;
}

// Initialize Modal
function initializeModal() {
    if (props.matchData) {
        setUserParticipant(props.matchData);
    }
}

// Watch Props for Visibility
watch(
    () => props.isVisible,
    (newVal) => {
        isVisible.value = newVal;
        if (newVal) {
            initializeModal();
        } else {
            resetModalState();
        }
    }
);


watch(
    () => props.matchData,
    (newMatchData) => {
        if (newMatchData) {
            localMatchData.value = newMatchData;
        }
    },
    { immediate: true }
);


// Reset Modal State
function resetModalState() {
    localMatchData.value = null;
    feedback.value = { mainIssues: [], subIssues: [], comments: '' };
    currentStep.value = 0;
}
</script>

<style>
/* Modal and Overlay Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
}

.questionnaire-modal {
    width: 60vh;
    height: 82vh;
    background: #091014;
    border-radius: 8px;
    padding: 60px;
    padding-top: 30px;
    display: flex;
    flex-direction: column;
    overflow: visible;
    position: relative;
}

.match-card {
    margin-bottom: 20px;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    align-items: center;
}

.close-button {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
}

.step-indicator {
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 10px;
    margin-top: 20px;
}

.progress-bar {
    background: #333;
    border-radius: 4px;
    height: 8px;
    width: 100%;
    margin-bottom: 5px;
    position: relative;
}

.progress {
    background: #FFA500;
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
    position: absolute;
    left: 0;
    top: 0;
}

.step-labels {
    display: flex;
    justify-content: space-evenly;
}

.step-labels span {
    color: #fff;
    font-size: 0.9rem;
    position: relative;
    padding: 0 5px;
    transition: color 0.3s ease;
}

.step-labels .active {
    font-weight: bold;
    color: #FFA500;
    font-size: 1rem;
}

.step-labels .completed {}

.step-labels .upcoming {
    color: #555;
}

.step-content {
    margin-top: 20px;
    border-top: 1px solid #444;
    flex: 1;
    overflow-y: auto;
}

.step-container {
    min-height: 300px;
    display: flex;
    flex-direction: column;
}

.step-title {
    font-size: 1.5rem;
    margin: 20px 0;
    text-align: left;
}

.modal-title {
    font-size: 2rem;
    margin-bottom: 20px;
    text-align: center;
    color: var(--gold-3);
    border-bottom: 1px solid #444;
}

.issue-options,
.sub-issue-options {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-start;
}

.sub-issue-group {
    margin-bottom: 20px;
    padding-left: 20px;
    border-left: 3px solid #FFA500;
}

.sub-issue-title {
    display: flex;
    align-items: center;
    color: #FFA500;
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.sub-issue-title span {
    flex: 1;
    word-wrap: break-word;
    padding-left: 10px;
    color: white;
}

.sub-issue-title i {
    font-size: 1.2rem;
    margin-right: 15px;
}

.sub-issue-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.issue-card,
.sub-issue-card {
    flex: 0 0 50%;
    max-width: 48%;
    min-width: 120px;
    height: auto;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    background: #1b2c35;
    padding: 10px 15px;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    box-sizing: border-box;
    white-space: normal;
    position: relative;
    border: 2px solid #1b2c35;
    opacity: 0.7;
}

.issue-card span,
.sub-issue-card span {
    flex: 1;
    word-wrap: break-word;
    font-size: 0.9rem;
}

.sub-issue-card {
    height: 50px;
}

.issue-card.selected,
.sub-issue-card.selected {
    background: #276e29;
}

.issue-card.selected,
.sub-issue-card.selected {
    border: 2px solid #FFA500;
    opacity: 1;
    background: #1b2c35;
}

.issue-card:hover,
.sub-issue-card:hover {
    background: #0F202D;
    transform: translateY(-2px);
}


.issue-card {
    background: #1b2c35;
    color: #FFFFFF;
    padding-left: 20px;
    transition: background 0.2s, transform 0.2s;
}

.sub-issue-icon {
    font-size: 1.5rem;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
    color: #ffffff;
}

.issue-icon.selected {
    color: #FFFFFF;
    opacity: 0.5;
    /* Reduce opacity when selected */
}

.issue-group {
    margin-bottom: 20px;
    padding-left: 20px;
}


.issue-icon {
    color: #FFA500;
    width: 24px;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.sub-issue-card {
    flex: 1 1 45%;
    height: 50px;
}

.issue-card span {
    color: #FFFFFF;
    font-size: 1rem;
}

/* Summary Card */
.summary-card {
    background: #1b2c35;
    padding: 15px;
    border: 2px solid #FFA500;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

/* Summary Section */
.summary-section {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    color: #fff;
}

.summary-section strong {
    color: #FFA500;
}

.summary-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.navigation-buttons {
    display: flex;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #444;
}


.navigation-buttons button {
    background: #007bff;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: background 0.3s;
    margin-left: 10px;
}

.navigation-buttons button:hover {
    background: #0056b3;
}

.navigation-buttons button:disabled {
    background: #555;
    cursor: not-allowed;
}

.back-button:hover {
    background: #FF4500;
    /* Orange Red */
}

.next-button[disabled] {
    position: relative;
}

.next-button[disabled]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background: #f44336;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.8rem;
    opacity: 1;
    pointer-events: none;
}

.next-button::after {
    content: '';
    opacity: 0;
    transition: opacity 0.3s;
}

/* Tooltip Wrapper to Push Next Button Right */
.tooltip-wrapper {
    position: relative;
    display: inline-block;
    margin-left: auto;
}

/* Tooltip Text */
.tooltip-text {
    visibility: hidden;
    width: 220px;
    background-color: #f44336;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px 12px;
    position: absolute;
    z-index: 1002;
    /* Ensure it's above the modal */
    bottom: 125%;
    /* Position above the button */
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.85rem;
}

/* Tooltip Arrow */
.tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #f44336 transparent transparent transparent;
}

/* Show the tooltip on hover */
.tooltip-wrapper:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
}


/* Transition styles */
.modal-transition-enter-active,
.modal-transition-leave-active {
    transition: all 0.3s ease;
}

.modal-transition-enter,
.modal-transition-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* Title Styling */
.step-container h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    text-align: center;
    color: #fff;
}

.step-container h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #fff;
}

/* Textarea Styling */
.step-container textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    border: none;
    border-radius: 6px;
    resize: vertical;
    font-size: 1rem;
    box-sizing: border-box;
    background: #2c2c2c;
    color: #fff;
}

.step-container textarea::placeholder {
    color: #aaa;
}

/* Feedback Summary Styling */
.feedback-summary p {
    margin-bottom: 10px;
    color: #fff;
    font-size: 1rem;
}

/* Responsive Adjustments */
@media (max-width: 650px) {
    .questionnaire-modal {
        width: 90%;
        height: 80vh;
    }

    .issue-card,
    .sub-issue-card {
        flex: 1 1 100%;
    }

    .step-container {
        min-height: auto;
    }
}
</style>