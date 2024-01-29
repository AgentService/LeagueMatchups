<template>
	<div v-if="tooltip.isVisible" class="tooltips">
		<div class="tooltip-content">
			<span class="item-name">{{ tooltip.content.name }}</span>
			<p class="item-description">{{ tooltip.content.description }}</p>
		</div>
	</div>
	<div class="card-header d-flex justify-content-between align-items-center">
		<span class="d-flex align-items-center">Match History
			<button class="btn " v-if="!selectedMatch" @click="fetchAndShowLastMatch">
				<i class="fas fa-refresh"></i>
			</button>
		</span>
		<div class="filter-container">
			<div class="filter-header">
				<i class="text-secondary fa-solid fa-filter"></i>
			</div>
			<div class="buttons-container d-flex align-items-center justify-content-between">
				<button class="btn" @click="clearFilter">
					<i class="fa-solid fa-ban fa-lg"></i>
				</button>
				<button class="btn" @click="filterMatchesByChampion">
					<img :src="getChampionImageSource('small', championB?.id)" alt="Champion" class="champion-icon-filter">
				</button>
			</div>

		</div>
	</div>
	<!-- List of matches -->
	<div v-if="!selectedMatch" class="matches-list ">

		<div v-for="(match, index) in rankedLastMatches" :key="index" class="match-card" @click="selectMatch(match)">
			<div class="timestamp">
				{{ calculateTimeSinceMatch(match.info.gameCreation) }} hours ago
			</div>

			<div class="match-card-body">

				<img :src="getChampionImageSource('small', getChampionNameById(getPlayerChampion(match)?.championId))"
					alt="Your Champion" class="champion-icon">
				<div class="match-result" :class="{ 'win': isWin(match), 'loss': !isWin(match) }">
					{{ isWin(match) ? 'Win' : 'Loss' }}
				</div>
				<!-- Item Images -->
				<!-- Other match details -->
				<div class="item-images">
					<div v-for="(itemId, index) in getPlayerChampionAndItems(match).items" :key="index" class="item-slot">
						<img v-if="itemId" :src="getItemImageSource(itemId)" :alt="`Item ${index + 1}`" class="item-icon"
							@mouseover="logItemDescription(itemId)" @mouseout="hideTooltip" />
						<!-- Tooltip Div -->

					</div>
				</div>

				<!-- KDA -->
				<div class="stat-column">
					<div class="stat-header">KDA</div>
					<div class="stat-value">
						<span>{{ getPlayerChampion(match).kills }}</span> /
						<span class="deaths">{{ getPlayerChampion(match).deaths }}</span> /
						<span>{{ getPlayerChampion(match).assists }}</span>
					</div>
				</div>
				<!-- CS -->
				<div class="stat-column">
					<div class="stat-header">
						CS</div>
					<div class="stat-value">
						{{ calculateCsPerMinute(getPlayerChampion(match)) }} / Min.
					</div>
				</div>
				<!-- Vision -->
				<div class="stat-column">
					<div class="stat-header">Vision</div>
					<div class="stat-value">
						{{ calculateVisionScorePerMinute(getPlayerChampion(match)) }} / Min.
					</div>
				</div>
			</div>
		</div>
	</div>
	<div v-if="selectedMatch" class="match-details-container">
		<button @click="goBackToList" class="back-button">Go Back to Matches</button>
		<div class="match-details">
			<!-- Team 1 Details -->
			<div class="team-details">
				<h4 class="team-header">Team 1</h4>
				<div v-for="participant in teamParticipants(selectedMatch, 100)" :key="participant.participantId"
					class="participant-row">

					<div class="participant-stats">
						<div class="champion-column">
							<img :src="getChampionImageSource('small', getChampionNameById(participant.championId))"
								alt="Champion Image" class="champion-image">
						</div>
						<div class="summoner-name">
							{{ formatSummonerName(participant.summonerName) }}
						</div>
						<div class="kda">
							{{ participant.kills }} / {{ participant.deaths }} / {{ participant.assists }}
						</div>
						<div class="cs">
							{{ getTotalMinionsKilled(participant) }} CS
						</div>
						<div class="vision-score">
							{{ participant.visionScore }} VS
						</div>
					</div>
				</div>
			</div>

			<!-- Team 2 Details -->
			<div class="team-details">
				<h4 class="team-header">Team 1</h4>
				<div v-for="participant in teamParticipants(selectedMatch, 200)" :key="participant.participantId"
					class="participant-row">
					<div class="participant-stats">
						<div class="champion-column">
							<img :src="getChampionImageSource('small', getChampionNameById(participant?.championId))"
								alt="Champion Image" class="champion-image">
						</div>
						<div class="summoner-name">
							{{ formatSummonerName(participant.summonerName) }}
						</div>
						<div class="kda">
							{{ participant.kills }} / {{ participant.deaths }} / {{ participant.assists }}
						</div>
						<div class="cs">
							{{ getTotalMinionsKilled(participant) }} CS
						</div>
						<div class="vision-score">
							{{ participant.visionScore }} VS
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { computed, ref, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { onMounted } from 'vue';

export default {
	name: 'MatchHistory',
	setup() {
		const store = useStore();

		const summonerData = computed(() => store.getters['summoner/currentSummonerData']);
		const summonerId = computed(() => summonerData.value ? summonerData.value.puuid : '');

		const championDetails = computed(() => store.state.champions.championDetails);
		const championB = computed(() => store.getters['matchups/getChampionB']);
		const filterApplied = ref(false);

		const selectedMatch = ref(null);
		const filteredMatches = ref([]);

		watch(summonerId, (newId, oldId) => {
			if (newId && newId !== oldId) {
				fetchAndShowLastMatch(newId);
			}
		});

		const showAllMatches = () => {
			filteredMatches.value = store.getters['matches/getMatchHistory'];
		};

		const clearFilter = () => {
			filteredMatches.value = []; // Reset filtered matches
			filterApplied.value = false; // Indicate that the filter is no longer applied
		};

		const filterMatchesByChampion = () => {
			filteredMatches.value = store.getters['matches/getMatchHistory'].filter(match => {
				const myParticipant = match.info.participants.find(p => p.puuid === summonerId.value);
				const isMyTeamFirstHalf = myParticipant.participantId <= 5;
				const enemyParticipants = match.info.participants.slice(isMyTeamFirstHalf ? 5 : 0, isMyTeamFirstHalf ? 10 : 5);

				return enemyParticipants.some(participant =>
					participant.championName === championB.value.id && participant.individualPosition === 'MIDDLE');
			});

			filterApplied.value = true; // Set to true when filter is applied
		};

		const rankedLastMatches = computed(() => {
			const isFilterApplied = filteredMatches.value.length > 0 || filterApplied.value;

			// If filteredMatches has been populated (i.e., filter has been applied), use it
			if (filteredMatches.value.length > 0) {
				return filteredMatches.value;
			}

			if (isFilterApplied) {
				return [];
			}
			// If filteredMatches is empty and filter has not been applied, return all matches
			return store.getters['matches/getMatchHistory']?.filter(match =>
				match.info.gameType === 'MATCHED_GAME'
			);
		});


		const tooltip = reactive({
			content: null,
			itemId: null, // Track the currently hovered item
			isVisible: false,
		});

		onMounted(() => {
			store.dispatch('items/fetchAllItems');
			fetchAndShowLastMatch();
		});
		const hideTooltip = () => {
			tooltip.itemId = null; // Reset the currently hovered item when mouse leaves
			tooltip.isVisible = false;
		};
		const getItemById = (itemId) => {
			// Assuming store.state.items is an array of all items with their details
			return store.getters['items/getItemById'](itemId);
		};

		// Method to format item description for HTML rendering
		const formatItemDescription = (description) => {
			return description.replace(/<[^>]*>/g, ''); // Simplify or enhance as needed
		};

		const logItemDescription = (itemId) => {
			const item = getItemById(itemId);
			if (item) {
				const description = item.description
					.replace(/<br>/g, '\n') // Replace <br> with line breaks
					.replace(/<\/?[^>]+(>|$)/g, '') // Remove all other HTML tags

				tooltip.content = {
					id: itemId,
					name: item.name,
					description: description.trim() // Remove leading/trailing spaces
				};
				tooltip.itemId = itemId; // Set the currently hovered item
				tooltip.isVisible = true;
			} else {
				tooltip.isVisible = false;
			}
		};

		const fetchAndShowLastMatch = async () => {
			if (summonerId.value) {
				await store.dispatch('matches/fetchLastMatch', { summonerId: summonerId.value, region: 'euw1' });
			} else {
				console.error('Summoner ID not found');
			}
		};

		const formatSummonerName = (name) => {
			return name.length > 10 ? name.substring(0, 10) + '...' : name;
		};
		const getTotalMinionsKilled = (participant) => {
			return participant.totalMinionsKilled + participant.neutralMinionsKilled;
		};

		const teamParticipants = (match, teamId) => {
			// Safely access participants array and filter by teamId
			return match.info.participants?.filter(participant => participant.teamId === teamId) || [];
		};

		const getChampionNameById = (championId) => {
			for (const key in championDetails.value) {
				if (championDetails.value[key].key === championId?.toString()) {
					return key; // Der Schlüsselname entspricht dem Champion-Namen
				}
			}
			return 'Unknown Champion';
		};

		const getPlayerChampionAndItems = (match) => {
			const participant = match.info.participants.find(p => p.puuid === summonerId.value);
			if (!participant) {
				return {
					champion: null,
					items: new Array(7).fill(null),
				};
			}

			let items = [];
			for (let i = 0; i < 6; i++) {
				items.push(participant[`item${i}`] || null);
			}
			items.push(participant.item6 || null); // Trinket slot

			return {
				champion: participant.championName, // Or however you wish to represent the champion
				items: items,
			};
		};


		const getItemImageSource = (itemId) => {
			return itemId ? `/img/items/${itemId}.png` : '';
		};

		const getPlayerChampion = (match) => {
			const participant = match.info.participants.find((p) => p.puuid === summonerId.value);
			if (!participant) {
				return "";
			}
			return participant;
		};

		const isWin = (match) => {
			const playerParticipant = getPlayerChampion(match);
			return playerParticipant ? playerParticipant.win : false;
		};

		const selectMatch = (match) => {
			selectedMatch.value = match;
		};

		const goBackToList = () => {
			selectedMatch.value = null;
		};

		// Funktion, um den Pfad zum Champion-Bild zu erhalten
		const getChampionImageSource = (type, championId) => {
			const sanitizedChampionId = championId?.replace(/\s+/g, '');

			switch (type) {
				case 'small':
					return `/img/champions/${sanitizedChampionId}.png`;
				case 'loading':
					return `/img/champion_loading/${sanitizedChampionId}.png`;
				case 'splash':
					return `/img/champion_splash/${sanitizedChampionId}.png`;
				case 'tiles':
					return `/img/tiles/${sanitizedChampionId}_0.jpg`;
				default:
					return ''; // Standardpfad oder Fehlerbehandlung
			}
		};

		const formatTimePlayed = (timeInSeconds) => {
			const minutes = Math.floor(timeInSeconds / 60);
			const seconds = timeInSeconds % 60;
			return `${minutes}:${seconds.toString().padStart(2, '0')}`;
		};

		const calculateCsPerMinute = (participant) => {
			const minutes = participant.timePlayed / 60;
			return (participant.totalMinionsKilled / minutes).toFixed(2);
		};

		const calculateVisionScorePerMinute = (participant) => {
			const minutes = participant.timePlayed / 60;
			return (participant.visionScore / minutes).toFixed(2);
		};

		const calculateTimeSinceMatch = (gameCreation) => {
			const matchDate = new Date(gameCreation);
			const now = new Date();
			const timeDiff = Math.abs(now - matchDate);
			const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
			return hoursDiff; // Returns the time difference in hours
		};

		const itemSlots = computed(() => {
			if (!selectedMatch.value) {
				console.error('No selected match found');
				return new Array(7).fill(null);
			}

			const participant = selectedMatch.value.info.participants.find(p => p.puuid === summonerId.value);
			console.log('Player Champion:', participant);

			if (!participant) {
				console.error('No participant found');
				return new Array(7).fill(null);
			}

			let slots = [];
			for (let i = 0; i < 6; i++) {
				slots.push(participant[`item${i}`] || null);
			}
			console.log('Item Slots:', slots);
			slots.push(participant.item6 || null); // Trinket slot
			return slots;
		});

		return {
			fetchAndShowLastMatch,
			getChampionImageSource,
			getChampionNameById,
			selectedMatch,
			selectMatch,
			goBackToList,
			getPlayerChampion,
			isWin,
			formatTimePlayed,
			calculateCsPerMinute,
			calculateVisionScorePerMinute,
			calculateTimeSinceMatch,
			teamParticipants,
			formatSummonerName,
			getTotalMinionsKilled,
			getItemImageSource,
			itemSlots,
			getPlayerChampionAndItems,
			rankedLastMatches,
			tooltip,
			getItemById,
			formatItemDescription,
			logItemDescription,
			hideTooltip,
			filterMatchesByChampion,
			filteredMatches,
			championB,
			clearFilter
		};
	},
};
</script>


<style scoped>
.filter-container {
	border: 1px solid var(--grey-3);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 0 1rem;
}

.filter-header {
	display: flex;
	align-items: center;
	justify-content: center;
	border-right: 1px solid var(--grey-3);
	padding-right: .5rem;
}

.tooltips {
	position: absolute;
	background-color: var(--hextech-black);
	color: var(--grey-1);
	z-index: 1050;
	top: 0%;
	right: 0%;
}

.item-icon:hover+.tooltip {
	display: block;
}

.tooltip-content {
	color: var(--grey-1);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	white-space: pre-line;
	padding: 12px;
	max-width: 400px;
	font-size: 0.85em;
}

.item-name {
	font-size: 1.2em;
	font-weight: bold;
	color: var(--gold-1);
}

.item-slot {
	width: 30px;
	height: 30px;
	border-radius: 0%;
	border: 1px solid #333;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.item-icon {
	width: 100%;
	height: 100%;
	border-radius: 0%;
}

.item-images {
	display: grid;
	grid-template-columns: repeat(8, 1fr);
	gap: 0px;
}

.item-icon {
	width: 30px;
	height: 30px;
	border-radius: 0%;
	border: 2px solid #333;
}


.back-button {
	position: absolute;
	top: 10px;
	right: 10px;
	z-index: 10;
}

.team-details {
	padding-top: 60px;
}

.btn {
	width: auto;
	display: block;
	margin: 0 auto;
}

.container {
	display: flex;
	flex-direction: column;
	border: none;
	height: 100%;
	border-radius: 15px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	color: #e7e7e7;
	transition: box-shadow 0.3s ease;
}

.matches-list,
.match-details-container {
	overflow-y: auto;
	padding: 20px;
	border-radius: 8px;
}

.match-details-container {
	position: relative;
	overflow-y: auto;
}

.participant-row {
	background: #010d18;
	margin: 5px;
	padding: 5px;
	border-radius: 4px;
}

.match-card-body {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
}

.champion-column {
	grid-column: 1 / 2;
}

.champion-image {
	width: 40px;
	height: 40px;
}

.participant-stats {
	flex: 1;
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	align-items: center;
	text-align: center;
}

.summoner-name {
	grid-column: 2 / 3;
}

.kda {
	grid-column: 3 / 4;
}

.cs {
	grid-column: 4 / 5;
}

.vision-score {
	grid-column: 5 / 6;
}




.summoner-name {
	flex-grow: 1;
	margin-left: 10px;
	color: #fff;
	font-weight: bold;
}

.kda,
.cs,
.vision-score {
	text-align: center;
	color: #ccc;
}

.kda .deaths {
	color: #f00;
}

.stat-header {
	font-size: 0.8em;
	color: #aaa;
}

.stat-value {
	font-size: 1em;
	color: #fff;
}


.match-card {
	display: flex;
	flex-direction: column;
	border-radius: 4px;
	overflow: hidden;
	margin-bottom: 10px;
	cursor: pointer;
	padding: 6px 0 12px 0px;
	border-bottom: 1px solid #33333341;
}

.match-result {
	padding: 5px 10px;
	color: #fff;
	font-weight: bold;
}

.win {
	color: #4CAF50;
}

.loss {
	color: #F44336;
}

.stat-column {
	text-align: center;
	padding: 0 10px;
}

.champion-icon {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	border: 3px solid #333;
}

.champion-icon-filter {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	border: 3px solid var(--grey-2);
}

.stat-header {
	font-size: 0.8em;
	color: #aaa;
}

.stat-header {
	font-size: 0.8em;
	color: #aaa;
}

.stat-value {
	font-size: 1em;
	color: #fff;
}

.timestamp {
	position: relative;
	align-self: flex-end;
	font-size: 0.6em;
	color: #777;
}
</style>
