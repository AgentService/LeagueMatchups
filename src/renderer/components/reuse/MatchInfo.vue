<template>
    <div v-if="match && playerChampion" class="match-info" :class="[isWin ? 'win-background' : 'loss-background']">
        <div class="champion-icon-container">
            <img :src="getChampionImageSource('small', playerChampion.championName)" alt="Your Champion"
                :class="['champion-icon', isWin ? 'win-border' : 'loss-border']" />
        </div>
        <div class="details-container">
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
                        <div class="kda">{{ calculateKDA(playerChampion) }} KDA</div>
                        <span>{{ playerChampion.kills }} /
                            <span class="deaths">{{ playerChampion.deaths }}</span> /
                            {{ playerChampion.assists }}
                        </span>
                    </div>
                    <div class="cs-block">
                        <div class="cs-min">{{ calculateCsPerMinute(playerChampion, match) }} CS/Min</div>
                        <span>{{ playerChampion.totalMinionsKilled }} CS</span>
                    </div>
                    <div class="vision-block">
                        <div class="vision-min">{{ calculateVisionScorePerMinute(playerChampion, match) }} Vis/Min</div>
                        <span>{{ playerChampion.visionScore }} Vision Score</span>
                    </div>
                </div>
            </div>

            <!-- Items and Teams Block (Teams aligned to the right of the items) -->
            <div class="items-and-teams">
                <div class="items-row">
                    <div v-for="(itemId, index) in playerItems" :key="index" class="item-slot">
                        <img v-if="itemId" :src="getItemImageSource(itemId)" :alt="`Item ${index + 1}`"
                            class="item-icon" @mouseover="showItemTooltip(itemId, $event)"
                            @mousemove="updateTooltipPosition($event)" @mouseout="hideTooltip" />
                    </div>
                </div>

                <!-- Teams block aligned to the right -->
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
    console.log("Team 100 participants:", team);
    return team;
});

const team200 = computed(() => {
    const team = props.match?.info?.participants?.filter(participant => participant.teamId === 200);
    console.log("Team 200 participants:", team);
    return team;
});

function getGameName(participant) {
    // Use the summonerName directly from the participant object
    return participant?.summonerName ?? 'Unknown';
}




const playerChampion = computed(() => {
    const puuid = store.state.summoner.playerDetails[0]?.puuid;
    const gameName = store.state.summoner.playerDetails[0]?.gameName;

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
/* Include the styles from your original .match-info class */
.match-info {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    height: 330px;
    width: 100%;
    overflow: hidden;
    border: 1px solid #1d1d1d73;
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
    background: linear-gradient(to bottom right, #122c31, #0b1a1d);
    background-color: #122c31;
}

.loss-background {
    background: linear-gradient(to bottom right, #3b1010, #270b0b);
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

.items-and-teams {
    display: flex;
    justify-content: space-between; /* Spread items and teams to opposite sides */
    align-items: flex-start;
}

.items-row {
    display: flex;
    align-items: center;
}

.item-slot {
    margin-right: 5px;
}

.team-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 20px; /* Add some space between items and teams */
}

.team-member {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
}

.team-icon {
    width: 25px;
    height: 25px;
    border-radius: 50%; /* Circular icon */
    margin-right: 5px;
}

.game-name {
    font-size: 0.85rem;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80px; /* Limit the width of the game name */
}

</style>