<template>
	<div :class="[themeClass, 'note-card', 'gradient-border', 'text-light', 'h-100']">
		<!-- Search Bar -->
		<div class="search-bar">
			<input type="text" v-model="searchTerm" @input="filterChampions" @click="showGrid" placeholder="Search..."
				class="form-control" />
		</div>

		<!-- Champion Grid Container -->
		<div class="champion-grid-container" :class="{ 'open': isGridVisible }">
			<!-- Champion Grid -->
			<div class="champion-grid" v-show="isGridVisible">
				<div v-for="champion in filteredChampions" :key="champion.id" class="champion-tile"
					@click="selectChampion(champion)">
					<img :src="getChampionImageSource('small', champion.id)" alt="Champion Image" />
					<span>{{ champion.name }}</span>
				</div>
			</div>
		</div>

		<!-- Detail View -->
		<div class="champion-detail" v-if="selectedChampion" v-show="!isGridVisible">
			<!-- Stats Container -->
			<div class="stats-container pt-4 ms-0">
				<!-- Iterate through your selected stats -->
				<div class="stat-item" v-for="statKey in selectedStatKeys" :key="statKey">
					<img :src="getStatImageUrl(statKey)" :alt="statKey" class="stat-icon" />
					<div class="stat-value">{{ selectedChampion?.stats[statKey] }}</div>
				</div>
			</div>

			<!-- Champion Image Container -->
			<div :class="[themeClass, 'champion-image-container']">
				<img class="champion-image" :src="getChampionImageSource('tiles', selectedChampion.id)"
					alt="Champion Image" />
				<!-- <p class="champion-name mt-0 fs-4">{{ selectedChampion.name }}</p> -->
			</div>
		</div>

		<!-- Abilities Section -->
		<div class="champion-abilities-card " v-if="selectedChampion" v-show="!isGridVisible">
			<div class="abilities-container justify-content-center">

				<!-- Passive with tooltip -->
				<div class="ability me-sm-0 pe-3" v-if="selectedChampion?.passive">
					<div class="ability-icon-wrapper">
						<img :src="getPassiveImageUrl(selectedChampion?.passive)" :alt="selectedChampion?.passive.name"
							class="tooltip-spell-icon" />
						<span class="ability-label">P</span>
					</div>
					<div class="tooltip">
						<div class="tooltip-content">
							<div class="tooltip-header">
								<img :src="getPassiveImageUrl(selectedChampion?.passive)"
									:alt="selectedChampion?.passive.name" class="tooltip-spell-icon" />
								<span class="ability-label">P</span>
							</div>
							<h5 class="spell-name">{{ selectedChampion?.passive.name }}</h5>
							<p class="spell-description">{{ selectedChampion?.passive.description }}</p>
						</div> <!-- ... -->
					</div>
				</div>
				<!-- Skills with tooltip -->
				<!-- Abilities -->
				<div v-for="(spell, index) in selectedChampion?.spells" :key="spell.id" class="ability pe-1 ">
					<div class="ability-icon-wrapper ">
						<img :src="getSpellImageUrl(spell)" :alt="spell.name" class="ability-icon" />
						<span class="ability-label">{{ getAbilityLabelByIndex(index) }}</span>
					</div>
					<div class="tooltip">
						<div class="tooltip-content">
							<div class="tooltip-header">
								<img :src="getSpellImageUrl(spell)" :alt="spell.name" class="tooltip-spell-icon" />
								<span class="ability-label">{{ getAbilityLabelByIndex(index) }}</span>
							</div>
							<h5 class="spell-name">{{ spell.name }}</h5>
							<div>
								<p class="spell-cooldown">Cooldown: <span class="value-text">{{
									spell.cooldownBurn
								}}</span></p>
								<p class="spell-cost">Cost: <span class="value-text">{{ spell.costBurn
								}}</span>
								</p>
							</div>
							<p class="spell-description">{{ spell.description }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
  
  
  
<script>
import { useStore } from "vuex";
import { ref, computed, onMounted } from "vue";
import gsap from "gsap";
import Debug from "debug";
const debug = Debug("app:component:ChampionSelection");
import ChampionTips from './ChampionTips.vue';

export default {
	props: {
		instanceId: {
			type: Number,
			required: true
		}
	},
	components: {
		ChampionTips
	},
	setup() {
		const elementToAnimate = ref(null);
		onMounted(() => {
			debug("Mounted");
			// Define the animation for the blue theme
			const blueAnimation = () => {
				gsap.to(elementToAnimate.value, {
					boxShadow: "0 0 20px rgba(0, 253, 255, 0.75)", // Blue glow
					borderColor: "#10FEFF", // Light blue
					repeat: -1, // repeat indefinitely
					yoyo: true, // go back and forth
					ease: "power1.inOut",
					duration: 1
				});
			};

			// Define the animation for the red theme
			const redAnimation = () => {
				gsap.to(elementToAnimate.value, {
					boxShadow: "0 0 28px rgba(255, 0, 0, 0.75)", // Red glow
					borderColor: "#FE1010", // Light red
					repeat: -1, // repeat indefinitely
					yoyo: true, // go back and forth
					ease: "power1.inOut",
					duration: 1
				});
			};

			// Check the instanceId and apply the corresponding animation
			if (this?.instanceId) {
				debug("instanceId:", this.instanceId);
				if (this.instanceId === 1) {
					blueAnimation();
				} else if (this.instanceId === 2) {
					redAnimation();
				}
			}
		});

		return { elementToAnimate };
	},
	data() {

		return {
			searchTerm: "",
			champions: [],
			filteredChampions: [],
			selectedChampion: null,
			selectedChampions: [], // Initialize empty array
			isGridVisible: false,
			championSelectedFromClient: null, // This will hold the auto-selected champion
			selectedStatKeys: ['hp', 'armor', 'spellblock', 'attackdamage', 'movespeed'],
			abilityLabels: ['Q', 'W', 'E', 'R']
		};
	},

	mounted() {
		const store = useStore();

		// Dispatch the action to fetch champion data
		debug("Fetching champion data...");
		store.dispatch("champions/fetchChampionData").then(() => {
			const listChampionsData = store.state.champions.championList;
			const detailedChampionsData = store.state.champions.championDetails;
			// Store the full list of champions for filtering
			this.champions = Object.values(detailedChampionsData);

			// Optionally, initialize filteredChampions with the full list if you want
			// all champions to be displayed before any search is performed.
			this.filteredChampions = [...this.champions];

			// Determine and select a preselected champion based on instanceId
			// Ensure there is a valid champion at the index before selecting
			const preselectedChampionIndex = this.instanceId === 1 ? 0 : 1;
			if (this.champions.length > preselectedChampionIndex) {
				const preselectedChampion = this.champions[preselectedChampionIndex];
				//this.selectChampion(preselectedChampion);
			}
		}).catch(error => {
			console.error("Error fetching champions:", error);
		});
	},
	computed: {
		filteredChampions() {
			if (!this.searchTerm) return this.champions;
			return this.champions.filter(champion =>
				champion.name.toLowerCase().includes(this.searchTerm.toLowerCase())
			);
		},
		themeClass() {
			return this.instanceId === 1 ? "blue-theme" : "red-theme";
		},
	},
	methods: {
		getPassiveImageUrl(passive) {
			// Construct the URL for the passive image
			const path = `./img/dragontail/13.21.1/img/passive/${passive?.image.full}`;
			return path;
		},
		getSpellImageUrl(spell) {
			return `./img/dragontail/13.21.1/img/spell/${spell.image.full}`;
		},
		getAbilityLabelByIndex(index) {
			return this.abilityLabels[index] || ''; // Fallback to empty string if index is out of range
		},
		getStatImageUrl(statKey) {
			const statIcons = {
				AdaptiveForce: 'StatModsAdaptiveForceIcon.png',
				armor: 'StatModsArmorIcon.png',
				attackdamage: 'StatModsAttackDamageIcon.png',
				// CDR: 'StatModsCDRScalingIcon.png',
				hp: 'StatModsHealthScalingIcon.png',
				spellblock: 'StatModsMagicResIcon.png',
				// abilitypower: 'StatModsAbilityPowerIcon.png',
				movespeed: 'StatModsMovementSpeedIcon.png',
			};
			return `./img/dragontail/img/perk-images/StatMods/${statIcons[statKey]}`;
		},

		checkScrollable() {
			const gridContainer = this.$refs.gridContainer; // You'll need to add a ref="gridContainer" to the element
			if (gridContainer.scrollHeight > gridContainer.clientHeight) {
				gridContainer.classList.add('is-scrollable');
			} else {
				gridContainer.classList.remove('is-scrollable');
			}
		},
		syncWithClient() {
			// Logic to sync with the League client and fetch the selected champion
			// For example, this could be set based on a response from an API call:
			// this.championSelectedFromClient = responseFromClient;
			this.isGridVisible = true; // Show the grid after syncing
		},
		showGrid() {
			this.isGridVisible = true;
		},

		// Method to hide the grid if you need it
		hideGrid() {
			this.isGridVisible = false;
		},
		filterChampions() {
			if (!this.searchTerm) return this.champions;
			this.filteredChampions = this.champions.filter(champion => {
				return champion.name.toLowerCase().includes(this.searchTerm.toLowerCase());
			});
		},
		selectChampion(champion) {
			this.selectedChampion = champion;
			this.hideGrid();
			debug("Selected champion:", this.selectedChampion);
			// Trigger the GSAP animation for the selected champion
			this.animateChampion();
			// Emit an event if you need to notify the parent component
			this.$emit("championSelected", this.selectedChampion);
		},
		animateChampion() {
			const animation = this.instanceId === 1 ? this.blueAnimation : this.redAnimation;
		},
		getChampionImageSource(type, championId) {
			switch (type) {
				case "small":
					return `/img/champions/${championId}.png`;
				case "loading":
					return `/img/champion_loading/${championId}.png`;
				case "splash":
					return `/img/champion_splash/${championId}.png`;
				case "tiles":
					return `/img/tiles/${championId}_0.jpg`;
				default:
					// Handle the case where the type does not match 'small' or 'loading'
					return ""; // or some default path
			}
		},
		toggleDropdown() {
			this.isDropdownOpen = !this.isDropdownOpen; // The toggle spell that opens or closes the dropdown
		},
		closeDropdown() {
			this.isDropdownOpen = false;
		},
	}
};
</script>

<style scoped>
/* Container for both passive and abilities */
.abilities-container {
	display: flex;
	padding: 0 10px;
}

.champion-abilities-card {
	margin-top: auto; /* Pushes the abilities to the bottom */
}

.ability {
	display: flex;
	align-items: center;
	position: relative;
}

.ability-icon-wrapper {
	position: relative;
	display: flex;
	cursor: pointer;
}

.ability-label {
	position: absolute;
	bottom: 0;
	right: 0;
	background-color: #000;
	color: #fff;
	padding: 2px 5px;
	font-size: 0.75rem;
	border-radius: 2px 0 0 0;
	/* Rounded top-left corner */
}

.ability-icon {
	display: block;
	width: 45px;
	height: 45px;
}

.tooltip {
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translate(-50%, 0);
	visibility: hidden;
	opacity: 0;
	background-color: black;
	color: var(--grey-1);
	padding: 1rem 2rem;
	border-radius: 0.25rem;
	z-index: 100;
	min-width: 300px;
	transition: visibility 0.2s, opacity 0.2s ease-in-out;
	/* Other styles */
}

.tooltip .ability-label {
	left: 2.7rem;
}


.tooltip div {
	margin-bottom: 0.5rem;
}

.tooltip div:last-child {
	margin-bottom: 0;
}

.tooltip-content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.tooltip-header {
	position: relative;
	width: 100%;
}

.tooltip-spell-icon,
.ability-icon {
	width: 45px;
	/* Adjust the size as needed */
	height: 45px;
}

.spell-name {
	color: var(--gold-1);
	font-weight: bold;
	margin-top: 10px;
	margin-bottom: 5px;
}

.spell-cooldown,
.spell-cost {
	font-size: 0.875rem;
	margin-bottom: 2px;
}

.spell-description {
	font-size: 0.875rem;
	margin-top: 10px;
}

.ability:hover .tooltip,
.stat-item:hover .tooltip {
	visibility: visible;
	opacity: 1;
}

.value-text {
	color: var(--blue-laser-1);
	/* Replace with your preferred shade of blue if needed */
}

.note-card {
	width: 100%;
	z-index: 9;
	/* This will take the full height of the parent */
	display: flex;
	flex-direction: column;
	justify-content: flex-start; /* Align children to the start of the flex container */
}

/* Adjust the grid container */
.champion-grid-container {
	overflow-y: auto;
	overflow-x: hidden;
	/* Scroll only if needed */
	position: relative;
	/* For absolute positioning of children */
}

.champion-grid-container.open {
	flex: 1;
	/* Grow when grid is open */
}


/* The grid itself */
.champion-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
	gap: 0.6rem;
	padding: 1rem;
	/* Padding inside the grid */
	box-sizing: border-box;
	position: absolute;
	/* Positioned absolutely within the container */
	top: 0;
	/* Align to the top of the container */
	left: 0;
	/* Align to the left of the container */
	right: 0;
	/* Align to the right of the container */
	bottom: 0;
	/* Align to the bottom of the container */
	z-index: 10;
	/* Above the detail view */
}

.champion-grid.is-scrollable {
	padding-right: 10px;
	/* Add some padding to the right to make room for the scrollbar */
}

.slim-row {
	top: 0;
	z-index: 100;
	position: fixed;
	justify-content: center;
	height: auto;
	/* Let the content define the height */
	flex-grow: 0;
	/* Do not allow the row to grow */
}

.search-bar {
	box-sizing: border-box;
	display: flex;
	justify-content: start;
}

.search-bar input.form-control {
	background: var(--grey-cool);
	width: 40%;
	height: 2rem;
	margin-bottom: 1rem;
	border: none;
	/* Set the width of the input to 50% of its parent */
	color: var(--gold-3);
}

/* Change the placeholder color */
.search-bar input.form-control::placeholder {
	color: var(--gold-3);
	/* Set the placeholder text color to gold */
}

/* For the placeholder image */
.champion-placeholder-image {
	/* Your styles for the placeholder image */
	color: var(--gold-3);
	/* If the image is an icon font, set the color to gold */
}


.champion-tile {
	background: var(--hextech-black);
	border: 1px solid var(--blue-7);
	/* Add more styles for padding, margins, etc. as needed */
}

.champion-name {
	margin-top: 0.5rem;
	/* Adds space above the champion name */
	font-size: 1.25rem;
	/* Sets the font size of the champion name */
}

/* Champion tile image */
.champion-tile img {
	max-width: 100%;
	/* Ensure the image does not exceed its container */
	display: block;
	/* Images are inline by default; change this to block to allow for margin */
	/* Space between the image and the name */
}

/* Champion tile name */
.champion-tile span {
	display: block;
	text-shadow: 1px 1px 2px var(--blue-6);
	/* Make the span a block element to allow for text alignment */
	text-align: center;
	/* Center the text */
	color: var(--gold-2);
	display: block;
	font-size: 1rem;
}

.champion-detail {
	display: flex;
	/* Spaces out the stats and image */
	text-align: center;
}

/* This will contain the champion image and name centered */
.champion-image-container {
	flex-grow: 1;
	/* Prevents the image container from shrinking */
	display: flex;
	flex-direction: column;
	align-items: center;
	/* Center children horizontally */
	/* Center children vertically */
	/* Center text for all children */
	margin-top: 1rem;
	/* Optional: adds some space above the container */
}

/* This will ensure the image fits well */
.champion-image {
	width: 100%;
	/* Full width of the container */
	max-width: 130px;
	/* Maximum width */
	height: auto;
	/* Maintain aspect ratio */
	margin-bottom: 0.5rem;
	/* Space between the image and the name */
}

.blue-theme .champion-image {
	border-radius: 50%;
	display: block;

	width: 150px;
	overflow: hidden;
	border: 2px solid var(--blue-laser-1);
}

/* .blue-theme .note-card {
	color: var(--blue-laser-1);
}

.red-theme .note-card {
	color: var(--red-laser-1);
} */


.red-theme .champion-image {
	display: block;
	border-radius: 50%;
	overflow: hidden;
	border: 3px solid var(--red-laser-1);
}

.blue-theme .champion-image {
	border: 3px solid var(--blue-laser-2);
	animation: blue-glow 2s infinite alternate;
}

.red-theme .champion-image {
	border: 3px solid var(--red-laser-1);
	animation: red-glow 2s infinite alternate;
}

@keyframes red-glow {

	0%,
	100% {
		border-color: var(--red-laser-2);
		/* Red */
		box-shadow: 0 0 14px 4px var(--red-laser-1);
		/* Red glow */
	}

	50% {
		border-color: var(--red-laser-1);
		box-shadow: 0 0 14px 4px var(--red-laser-2);
		/* Constant Red glow */
	}
}

@keyframes blue-glow {

	0%,
	100% {
		border-color: var(--blue-laser-2);
		/* Blue */
		box-shadow: 0 0 14px 4px var(--blue-laser-1);
		/* Blue glow */
	}

	50% {
		border-color: var(--blue-laser-1);
		box-shadow: 0 0 14px 4px var(--blue-laser-2);
		/* Constant Blue glow */
		/* Red glow */
	}
}

/* Scrollbar styles for the search bar or its container */
.champion-grid::-webkit-scrollbar {
	padding-right: 10px;
	width: .75rem;
	/* Width of the scrollbar */
}

.blue-theme .champion-grid::-webkit-scrollbar-thumb {
	background-color: var(--blue-laser-1);
	border-radius: 6px;
	height: 2rem;
}

.champion-grid::-webkit-scrollbar-track {
	background-color: var(--navbar-background-elements);
	/* Black color for the track */
}

.red-theme .champion-grid::-webkit-scrollbar-thumb {
	background-color: var(--red-laser-1);
	border-radius: 6px;
	height: 2rem;
}

.stat-item {
	display: flex;
	align-items: center;
}

.stats-container {
	flex-grow: 0;
	/* Allows the stats container to grow as needed */
	align-items: flex-start;
	/* Aligns stats to the start of the flex container */
}

.stat-icon {
	width: 24px;
	/* Smaller icon width */
	height: 24px;
	/* Smaller icon height */
}

.stat-value {
	margin-left: 0.5rem;
	/* Space between icon and value */
	font-size: 0.9rem;
	/* Smaller font size for stat value */
}</style>
