<template>
	<div :class="[themeClass, 'note-card', 'gradient-border', 'text-light', 'align-items-stretch']">
		<div class="note-card ">
			<!-- Search Bar - Toggles the grid when clicked -->
			<div class="search-bar">
				<input type="text" v-model="searchTerm" @input="filterChampions" @click="showGrid" placeholder="Search..."
					class="form-control" />
			</div>

			<div class="champion-grid-container" :class="{ 'open': isGridVisible }">
				<!-- Champion Grid - Visible when isGridVisible is true -->
				<div class="champion-grid" v-show="isGridVisible">
					<div v-for="champion in filteredChampions" :key="champion.id" class="champion-tile"
						@click="selectChampion(champion)">
						<img :src="getChampionImageSource('small', champion.id)" alt="Champion Image" />
						<span>{{ champion.name }}</span>
					</div>
				</div>
			</div>
			<!-- Detail View - Shown when a champion is selected -->
			<div class="champion-detail " v-if="selectedChampion" v-show="!isGridVisible">
				<div :class="[themeClass, 'champion-image-container']">
					<img class="champion-image" :src="getChampionImageSource('tiles', selectedChampion.id)"
						alt="Champion Image" />
					<!-- Insert more details here as needed -->
					<p class="mt-0 fs-4">{{ selectedChampion.name }}</p>
					<!-- For example, add lore, abilities, stats etc. -->
					<!-- ... -->
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
.note-card {
	width: 100%;
	z-index: 1000;
	height: 100%;
	/* This will take the full height of the parent */
	display: flex;
	flex-direction: column;
	overflow: hidden;
	/* Changed from auto to hidden to control overflow within child elements */
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
	justify-content: center;
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
	justify-content: center;
	align-items: center;
	text-align: center;
}

/* This will contain the champion image and name centered */
.champion-image-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	/* Center children horizontally */
	justify-content: center;
	/* Center children vertically */
	text-align: center;
	/* Center text for all children */
	margin-top: 1rem;
	/* Optional: adds some space above the container */
}

/* This will ensure the image fits well */
.champion-image {
	width: 100%;
	/* Full width of the container */
	max-width: 110px;
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
</style>
