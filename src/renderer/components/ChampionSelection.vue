<template>
	<div :class="[themeClass, 'note-card', 'text-light', 'h-100', 'gradient-border']">
		<!-- Search Bar -->
		<div class="search-bar m-3 ">
			<input type="text" v-model="searchTerm" @input="filterChampions" @click="showGrid" placeholder="Search"
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
		<div class="champion-detail-container" v-if="selectedChampion" v-show="!isGridVisible">
			<div class="champion-detail-wrapper">

				<!-- Champion Detail View -->
				<div class="champion-detail" v-if="selectedChampion" v-show="!isGridVisible">
					<div v-if="instanceId === 1"
						class="champion-image-container col-md-6 order-md-2 d-flex justify-content-center align-items-center">
						<img class="champion-image" :ref="getInstanceIdRef"
							:src="getChampionImageSource('tiles', selectedChampion.id)" alt="Champion Image" />
					</div>
					<!-- Stats Container - This will be on the opposite side of the image -->
					<div v-if="instanceId === 1" class="stats-container col-md-3 order-md-1 d-flex">
					</div>
					<div v-if="instanceId === 1"
						class="stats-container col-md-3 order-md-3 d-flex justify-content-start align-items-start">
						<button type="button" class="btn btn-outline-secondary btn-sm"
							@click="isStatsCollapsed = !isStatsCollapsed">
							<img :src="getStatImageUrl('statToggle')" alt="Toggle Stats" class="stat-toggle-icon" />
						</button>

						<div class="stats-container collapse align-items-start" :class="{ show: !isStatsCollapsed }">
							<div class="stat-item" v-for="statKey in selectedStatKeys" :key="statKey">
								<img :src="getStatImageUrl(statKey)" :alt="statKey" class="stat-icon" />
								<div class="stat-value">{{ selectedChampion.stats[statKey] }}</div>
							</div>
						</div>
					</div>
					<div v-if="instanceId === 2"
						class="stats-container justify-content-center align-items-center col-md-3 order-md-3">
					</div>
					<!-- For instanceId 2, the order is naturally reversed -->
					<div v-if="instanceId === 2"
						class="champion-image-container col-md-6 order-md-2 d-flex justify-content-center align-items-center">
						<img class="champion-image" :ref="getInstanceIdRef"
							:src="getChampionImageSource('tiles', selectedChampion.id)" alt="Champion Image" />
					</div>
					<div v-if="instanceId === 2"
						class="stats-container justify-content-start col-md-3 order-md-1 align-items-end">
						<button type="button" class="btn btn-outline-secondary btn-sm"
							@click="isStatsCollapsed = !isStatsCollapsed">
							<img :src="getStatImageUrl('statToggle')" alt="Toggle Stats" class="stat-toggle-icon" />
						</button>

						<div class="stats-container align-items-end collapse" :class="{ show: !isStatsCollapsed }">
							<!-- Iterate through your selected stats -->
							<div class="stat-item" v-for="statKey in selectedStatKeys" :key="statKey">
								<div class="stat-value">{{ selectedChampion.stats[statKey] }}</div>
								<img :src="getStatImageUrl(statKey)" :alt="statKey" class="stat-icon" />
							</div>
						</div>
					</div>

				</div>

				<!-- Abilities Section -->
				<div class="champion-abilities-card " v-if="selectedChampion" v-show="!isGridVisible">
					<div class="abilities-container">

						<!-- Passive with tooltip -->
						<div class="ability" v-if="selectedChampion?.passive">
							<div class="ability-icon-wrapper">
								<img :src="getPassiveImageUrl(selectedChampion?.passive)"
									:alt="selectedChampion?.passive.name" class="tooltip-spell-icon" />
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
						<div v-for="(spell, index) in selectedChampion?.spells" :key="spell.id" class="ability ps-1">
							<div class="ability-icon-wrapper ">
								<img :src="getSpellImageUrl(spell)" :alt="spell.name" class="ability-icon" />
								<span class="ability-label">{{ getAbilityLabelByIndex(index) }}</span>
							</div>
							<div class="tooltip-container">
								<div class="tooltip">
									<div class="tooltip-content">
										<div class="tooltip-header">
											<img :src="getSpellImageUrl(spell)" :alt="spell.name"
												class="tooltip-spell-icon" />
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
			</div>
		</div>
	</div>
</template>
  
  
  
<script>
import { useStore } from "vuex";
import { ref, computed } from "vue";
import gsap from "gsap";
import Debug from "debug";
const debug = Debug("app:component:ChampionSelection");

export default {
	props: {
		instanceId: {
			type: Number,
			required: true
		}
	},
	setup(props) {
		const elementToAnimate = ref(null);

		const getInstanceIdRef = el => {
			if (props.instanceId === 1 || props.instanceId === 2) {
				elementToAnimate.value = el;
			}
		};

		const blueAnimation = () => {
			gsap.to(elementToAnimate.value, {
				boxShadow: "0 0 4px 5px rgba(0, 253, 255, 0.7)", // Blue glow
				borderColor: "#41fcfc", // Light blue
				repeat: -1, // repeat indefinitely
				yoyo: true, // go back and forth
				ease: "power1.inOut",
				duration: 3
			});
		};

		// Define the animation for the red theme
		const redAnimation = () => {
			gsap.to(elementToAnimate.value, {
				boxShadow: "0 0 6px 5px rgba(255, 0, 0, 0.7)", // Red glow
				borderColor: "#fa6969", // Light red
				repeat: -1, // repeat indefinitely
				yoyo: true, // go back and forth
				ease: "power1.inOut",
				duration: 3
			});
		};
		return { elementToAnimate, blueAnimation, redAnimation, getInstanceIdRef };
	},
	data() {

		return {
			searchTerm: "",
			champions: [],
			selectedChampion: null,
			selectedChampions: [], // Initialize empty array
			isGridVisible: false,
			championSelectedFromClient: null, // This will hold the auto-selected champion
			selectedStatKeys: ["hp", "armor", "spellblock", "attackdamage", "movespeed"],
			abilityLabels: ["Q", "W", "E", "R"],
			isStatsCollapsed: false,
		};
	},

	mounted() {
		const store = useStore();
        const championsData = computed(() => store.state.champions.championList);

		this.champions = championsData ? Object.values(championsData.value) : [];

		// Determine and select a preselected champion based on instanceId
		const preselectedChampionIndex = this.instanceId === 1 ? 1 : 2;
		if (this.champions.length > preselectedChampionIndex) {
			const preselectedChampion = this.champions[preselectedChampionIndex];
			this.selectChampion(preselectedChampion);
		}
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
		toggleStats() {
			this.isStatsCollapsed = !this.isStatsCollapsed;
		},
		getPassiveImageUrl(passive) {
			// Construct the URL for the passive image
			const path = `./img/dragontail/13.21.1/img/passive/${passive?.image.full}`;
			return path;
		},
		getSpellImageUrl(spell) {
			return `./img/dragontail/13.21.1/img/spell/${spell.image.full}`;
		},
		getAbilityLabelByIndex(index) {
			return this.abilityLabels[index] || ""; // Fallback to empty string if index is out of range
		},
		getStatImageUrl(statKey) {
			const statIcons = {
				AdaptiveForce: "StatModsAdaptiveForceIcon.png",
				armor: "StatModsArmorIcon.png",
				attackdamage: "StatModsAttackDamageIcon.png",
				// CDR: 'StatModsCDRScalingIcon.png',
				hp: "StatModsHealthScalingIcon.png",
				spellblock: "StatModsMagicResIcon.png",
				// abilitypower: 'StatModsAbilityPowerIcon.png',
				movespeed: "StatModsMovementSpeedIcon.png",
				statToggle: "StatModsButton.png"
			};
			return `./img/dragontail/img/perk-images/StatMods/${statIcons[statKey]}`;
		},

		checkScrollable() {
			const gridContainer = this.$refs.gridContainer; // You'll need to add a ref="gridContainer" to the element
			if (gridContainer.scrollHeight > gridContainer.clientHeight) {
				gridContainer.classList.add("is-scrollable");
			} else {
				gridContainer.classList.remove("is-scrollable");
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
			this.selectedChampion = null; // Optionally reset the selected champion when showing the grid
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
			this.$nextTick(() => {
				// Trigger the GSAP animation for the selected champion
				this.animateChampion();
			});
			// Emit an event if you need to notify the parent component
			this.$emit("championSelected", this.selectedChampion);
		},
		animateChampion() {
			const animation = this.instanceId === 1 ? this.blueAnimation : this.redAnimation;
			if (animation && this.elementToAnimate) {
				animation();
			}
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
.stat-toggle-icon {
	width: 24px;
	/* Size of the collapse icon */
	height: 24px;
	/* Size of the collapse icon */
	cursor: pointer;
	/* Indicates the image is clickable */
	/* Additional styles for hover effects, transitions, etc. */
}

.champion-detail-container {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
}

.champion-detail-wrapper {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	/* Or whatever maximum width you prefer */
	margin: 0 auto;
	/* Center the wrapper if it's not as wide as its parent */
}

.champion-image {
	border-radius: 10%;
	max-width: 100%;
	/* Ensure the image is responsive and does not overflow its container */
	max-height: 100%;
	/* Optional, if you want to restrict the image's height */
	/* Remove absolute positioning if it's set */
}

.stats-container {
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
}


.stat-item {
	display: flex;
	justify-content: center;
	/* Center stat items */
	align-items: center;
}

.tooltip-container {
	position: absolute;
	/* or 'absolute' or 'fixed' */
	z-index: 11;
	/* or any positive value */
}

/* Container for both passive and abilities */
.abilities-container {
	display: flex;
}

.champion-abilities-card {
	margin: auto;
	/* Pushes the abilities to the bottom */
}

.ability {
	display: flex;
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
	background-color: black;
	color: #fff;
	padding: 2px 5px;
	font-size: 0.75rem;
	border-radius: 2px 0 0 0;
	/* Rounded top-left corner */
}


.tooltip {
	position: absolute;
	bottom: 50%;
	left: 50%;
	transform: translate(-50%, 0);
	visibility: hidden;
	opacity: 0;
	background-color: var(--hextech-black);
	color: var(--grey-1);
	padding: 1rem 2rem;
	border-radius: 0.25rem;
	z-index: 1050;
	min-width: 300px;
	transition: visibility 0.2s, opacity 0.2s ease-in-out;
	/* Other styles */
}

.tooltip .ability-label {
	left: 2.7rem;
	background-color: transparent;

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

.ability:hover .tooltip {
	visibility: visible;
	opacity: 1;
}

.value-text {
	color: var(--blue-laser-1);
	/* Replace with your preferred shade of blue if needed */
}

.note-card {
	width: 100%;
	z-index: 119;
	display: flex;
	flex-direction: column;
}

/* Adjust the grid container */
.champion-grid-container {
	overflow-y: auto;
	overflow-x: hidden;
	/* Scroll only if needed */
	position: relative;
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
	padding: 2rem;
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
	padding-right: 1rem;
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
	justify-content: center;
}

.search-bar input.form-control {
	background: var(--grey-cool);
	width: 40%;
	height: 2rem;
	margin-bottom: 1rem;
	text-align: center;
	border: none;
	/* Set the width of the input to 50% of its parent */
	color: var(--gold-3);
}

.search-bar input.form-control::placeholder {
	color: var(--gold-3);
	/* Set the placeholder text color to gold */
}

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
	font-size: 1.25rem;
}

.champion-tile img {
	max-width: 100%;
	display: block;
}

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


.champion-image {
	/* Full width of the container */
	max-width: 155px;
	/* Maximum width */
	height: auto;
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

.blue-theme .champion-image {
	will-change: box-shadow, border-color;

	box-shadow: 0 0 5px 5px rgba(0, 253, 255, 1);
	border-color: #10FEFF;
	border: 2px solid #10FEFF;
	/* animation: blue-glow 1s ease-in infinite ; */
}

.red-theme .champion-image {
	will-change: box-shadow, border-color;
	box-shadow: 0 0 5px 5px rgba(255, 0, 0, 1);
	border-color: #FE1010;
	border: 2px solid #fe1010;
}

@keyframes blue-glow {

	0% {
		box-shadow: 0 0 3px 3px rgba(0, 253, 255, 1);
		border-color: #10FEFF;
	}

	100% {
		box-shadow: 0 0 3px 3px rgba(0, 253, 255, 10);
		border-color: #10FEFF;
	}
}

@keyframes red-glow {

	0% {
		box-shadow: 0 0 3px 3px rgba(255, 0, 0, 1);
		border-color: #FE1010;
	}

	100% {
		box-shadow: 0 0 3px 3px rgb(255, 0, 0);
		border-color: #FE1010;
	}
}


.champion-image-container {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	/* Set a specific height if needed */
}

.stat-icon {
	width: 24px;
	height: 24px;
}

.stat-value {
	font-size: 0.9rem;
}
</style>
