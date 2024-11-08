<template>
    <div v-if="match && playerChampion" class="match-info" :class="[isWin ? 'win-background' : 'loss-background']">
        <!-- Champion Icon -->
        <div class="champion-icon-container">
            <img :src="getChampionImageSource('small', playerChampion.championName)" alt="Your Champion"
                :class="['champion-icon', isWin ? 'win-border' : 'loss-border']" />

            <!-- Reviewed/Not-Reviewed Icon -->
            <div class="review-status">
                <div :class="['review-status-button', isMatchReviewed ? 'reviewed' : 'not-reviewed']">
                    <i :class="isMatchReviewed ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    <span class="review-status-label">
                        Reviewed
                    </span>
                </div>
            </div>
        </div>

        <!-- Left Section: items, cs, vision, kda, win/loss info -->
        <div class="left-section">
            <!-- Match Result, Duration, and Time Since Match -->
            <div class="stats-block mb-2">
                <div class="stats-row">
                    <div :class="['match-result', isWin ? 'win' : 'loss']">
                        {{ isWin ? 'Win' : 'Loss' }}
                    </div>
                    <span class="timestamp">•</span>
                    <span class="game-duration">{{ formatDuration(match.info.gameDuration) }}</span>
                    <span class="timestamp">•</span>
                    <div class="timestamp">
                        {{ calculateTimeSinceMatch(match.info.gameCreation) }}
                    </div>
                </div>
            </div>

            <!-- KDA, CS, and Vision Score -->
            <div class="stats-block">
                <div class="stats-row">
                    <div class="kda-details">
                        <div class="kda">{{ calculateKDA(playerStats) }} KDA</div>
                        <span>{{ playerStats.kills }} / <span class="deaths">{{ playerStats.deaths }}</span> /
                            {{ playerStats.assists }}</span>
                    </div>
                    <div class="cs-block">
                        <div class="cs-min">{{ calculateCsPerMinute(playerStats, match) }} CS/Min</div>
                        <span>{{ playerStats.totalMinionsKilled }} CS</span>
                    </div>
                    <div class="vision-block">
                        <div class="vision-min">{{ calculateVisionScorePerMinute(playerStats, match) }} Vis/Min</div>
                        <span>{{ playerStats.visionScore }} VS</span>
                    </div>
                </div>
            </div>

            <!-- Items -->
            <div class="items-row">
                <div v-for="(itemId, index) in playerItems" :key="index" class="item-slot">
                    <img v-if="itemId" :src="getItemImageSource(itemId)" :alt="`Item ${index + 1}`" class="item-icon"
                        @mouseover="showItemTooltip(itemId, $event)" @mousemove="updateTooltipPosition($event)"
                        @mouseout="hideTooltip" />
                </div>
            </div>
        </div>

        <!-- Right Section: Teams -->
        <div class="right-section">
            <!-- Teams block -->
            <div class="teams-block">
                <!-- Team 100 -->
                <div class="team-info">
                    <div v-for="participant in team100" :key="participant.puuid" class="team-member">
                        <img :src="getChampionImageSource('small', participant.championName)" alt="Champion Icon"
                            class="team-icon" />
                        <span class="game-name">{{ getGameName(participant) }}</span>
                    </div>
                </div>

                <!-- Team 200 -->
                <div class="team-info">
                    <div v-for="participant in team200" :key="participant.puuid" class="team-member">
                        <img :src="getChampionImageSource('small', participant.championName)" alt="Champion Icon"
                            class="team-icon" />
                        <span class="game-name">{{ getGameName(participant) }}</span>
                    </div>
                </div>
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

    </div>
</template>





<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
    match: {
        type: Object,
        required: true,
    },
});
const store = useStore();
const team100 = computed(() => {
    const team = props.match?.info?.participants?.filter(participant => participant.teamId === 100);
    return team;
});

const team200 = computed(() => {
    const team = props.match?.info?.participants?.filter(participant => participant.teamId === 200);
    return team;
});

const playerStats = computed(() => {
    if (playerChampion.value?.stats) {
        return playerChampion.value.stats; // API response case
    }
    return playerChampion.value; // WebSocket response case
});

function getGameName(participant) {
    // Use the summonerName directly from the participant object
    return participant?.riotIdGameName ?? 'Unknown';
}

const playerChampion = computed(() => {
    const currentSummoner = store.getters['summoner/getCurrentSummoner'];

    // Extract puuid and gameName from currentSummoner
    const puuid = currentSummoner?.apiResponse?.puuid;
    const gameName = currentSummoner?.apiResponse?.gameName;

    const matchInfo = props.match.info || props.match; // Normalize data to handle both cases (API vs WebSocket)

    // If puuid or gameName isn't available, return null
    if ((!puuid && !gameName) || !matchInfo) return null;

    // Try finding the player in the 'participants' list using puuid
    let player = matchInfo.participants?.find(p => p.puuid === puuid);

    // If player isn't found by puuid, try to match with gameName using participantIdentities
    if (!player && matchInfo.participantIdentities) {
        const participantIdentity = matchInfo.participantIdentities.find(
            pi => pi.player.gameName === gameName
        );
        if (participantIdentity) {
            const participantId = participantIdentity.participantId;
            player = matchInfo.participants?.find(p => p.participantId === participantId);
        }
    }
    // If player is found, add the championName to the player object
    if (player) {
        const championName = getChampionName(player.championId);
        return { ...player, championName };
    }

    return {};
});




function getChampionName(championId) {
    const champions = store.getters['champions/getChampionDetails'];
    const champion = Object.values(champions).find(c => c.key === String(championId));
    return champion ? champion.name : 'Unknown Champion';
}


const isWin = computed(() => playerChampion.value?.win ?? false);

const isMatchReviewed = computed(() =>
    store.getters['matches/isMatchReviewed'](props.match.info.gameId)
);

const playerItems = computed(() => {
    const p = playerChampion.value;
    return [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6];
});

// Helper Functions
const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const calculateTimeSinceMatch = (gameCreation) => {
    const now = Date.now();
    const diff = now - gameCreation;
    const diffInMinutes = Math.floor(diff / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
};

const calculateKDA = (participant) => {
    const kills = participant?.kills ?? 0;
    const deaths = participant?.deaths === 0 ? 1 : participant?.deaths ?? 1; // Prevent division by 0
    const assists = participant?.assists ?? 0;

    return ((kills + assists) / deaths).toFixed(2);
};

const calculateCsPerMinute = (participant, match) => {
    const matchInfo = match.info || match; // Handle both structures
    const cs = (participant?.totalMinionsKilled ?? 0) + (participant?.neutralMinionsKilled ?? 0);
    const minutes = matchInfo.gameDuration / 60;
    return (cs / minutes).toFixed(1);
};

const calculateVisionScorePerMinute = (participant, match) => {
    const matchInfo = match.info || match; // Handle both structures
    const vs = participant?.visionScore ?? 0;
    const minutes = matchInfo.gameDuration / 60;
    return (vs / minutes).toFixed(1);
};


const getChampionImageSource = (type, championId) => {
    return store.getters['matches/getChampionImageSource'](type, championId);
};

const getItemImageSource = (itemId) => store.getters['matches/getItemImageSource'](itemId);

// Tooltip Logic
const tooltip = ref({
    content: null,
    isVisible: false,
});

const tooltipPosition = ref({
    top: '0px',
    left: '0px',
});

const showItemTooltip = (itemId, event) => {
    const item = store.getters['items/getItemById'](itemId);
    if (item) {
        const description = item.description.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, '');
        tooltip.value = {
            content: {
                name: item.name,
                description: description.trim(),
            },
            isVisible: true,
        };
        updateTooltipPosition(event);
    }
};

const updateTooltipPosition = (event) => {
    tooltipPosition.value = {
        top: `${event.clientY + 20}px`,
        left: `${event.clientX - 10}px`,
    };
};

const hideTooltip = () => {
    tooltip.value.isVisible = false;
};
</script>

<style scoped>
.review-status {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
    margin-top: 12px;
}

.review-status-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 5px;
    font-size: 0.875rem;
    color: #fff;
    transition: background-color 0.3s ease, color 0.3s ease;
    cursor: pointer;
}

.review-status-button i {
    font-size: .8rem;
}

/* Default neutral state */
.review-status-button {
    background-color: #555;
    color: #fff;
}

/* Green for Reviewed */
.review-status-button.reviewed {
    background-color: #2e6b30;
}

/* Red for Not Reviewed */
.review-status-button.not-reviewed {
    background-color: #691c17;
}

.review-status-label {
    font-size: 0.7rem;
    margin-left: 4px;
}

.match-info {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1px;
    height: auto;
    width: 100%;
    overflow: hidden;
    border: 1px solid #000000;
    border-radius: 5px;
}

.match-info:hover {
    background-color: #3a3a3a;
}

.left-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.win-background {
    background: linear-gradient(to bottom right, #122c31, #0b1a1d);
}

.loss-background {
    background: linear-gradient(to bottom right, #3b1010, #270b0b);
}

.match-result {
    font-weight: bold;
    font-size: 1rem;
}

.match-result.win {
    color: #30d9d3;
}

.match-result.loss {
    color: #F44336;
}

.champion-icon-container {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    text-align: center;
    margin-right: 6px;
    margin-top: 4px;
}

.champion-icon {
    width: 75px;
    height: 75px;
    border-radius: 4%;
    border: 2px solid transparent;
}

.win-border {
    border-color: #30d9d3;
}

.loss-border {
    border-color: #F44336;
}

.kda {
    font-weight: 400;
}

.stats-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
}

.timestamp {
    color: #999;
    font-size: 0.8rem;
}

.game-duration {
    font-weight: bold;
    font-size: 0.8rem;
    color: #999;
}

.stats-block {
    display: flex;
    font-size: 0.8rem;
    font-weight: 400;
    flex-direction: column;

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
    width: 80px;
}

.cs-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 80px;
}

.vision-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 80px;
}

.items-row {
    display: flex;
    align-items: center;
}

.item-icon {
    width: 28px;
    height: 28px;
    border: 2px solid #000000;
}

.right-section {
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
}

.teams-block {
    display: flex;
    flex-direction: row;
    gap: 4px;
}

.team-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.team-member {
    display: flex;
    align-items: center;
}

.team-icon {
    width: 25px;
    height: 25px;
    margin-right: 4px;
}

.game-name {
    font-size: 0.75rem;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60px;
    font-weight: 400;
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
</style>