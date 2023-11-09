<template>
	<div :class="[themeClass, 'note-card', 'gradient-border', 'text-light']">
		<div class="note-card">

			<!-- Search Bar - Toggles the grid when clicked -->
			<div class="search-bar">
				<input type="text" v-model="searchTerm" @input="filterChampions" @click="showGrid" placeholder="Search..."
					class="form-control" />
			</div>

			<!-- Champion Grid - Visible when isGridVisible is true -->
			<div class="champion-grid" v-show="isGridVisible">

				<div v-for="champion in filteredChampions" :key="champion.id" class="champion-tile"
					@click="selectChampion(champion)">
					<img :src="getChampionImageSource('small', champion.id)" alt="Champion Image" />
					<span>{{ champion.name }}</span>
				</div>
			</div>

			<!-- Detail View - Shown when a champion is selected -->
			<div class="champion-detail" v-if="selectedChampion" v-show="!isGridVisible">
				<div :class="[themeClass, 'champion-image-container']">
					<img class="champion-image" :src="getChampionImageSource('tiles', selectedChampion.id)"
						alt="Champion Image" />
					<!-- Insert more details here as needed -->
					<p class="mt-3 fs-4">{{ selectedChampion.name }}</p>
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

export default {
	props: {
		instanceId: {
			type: Number,
			required: true
		}
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
	},
	computed: {
		themeClass() {
			return this.instanceId === 1 ? "blue-theme" : "red-theme";
		},
	},
};
</script>

<style scoped>
.note-card {
	width: 100%;
	/* Full width of the card */
	height: 100%;
	/* Full height of the card */
	display: flex;
	/* Use flexbox to manage the layout */
	flex-direction: column;
	/* Stack children vertically */
}

.champion-grid-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: auto;

	/* Ensure the padding does not increase the total width of the element */
	/* Other styles... */
	/* Ensure the container fills the parent height */
}

/* Style for the champion grid container */
.champion-grid {
	flex-grow: 1;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
	gap: 0.6rem;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 1rem;
	box-sizing: border-box;
	margin-right: 20px;
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
	padding: 0 2rem;
}

.search-bar {
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	padding-bottom: 0rem;
}

.search-bar input.form-control {
	background: var(--grey-cool);
	width: 40%;
	/* Set the width of the input to 50% of its parent */
	border-bottom: 2px solid var(--gold-4);
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
	margin-bottom: 0.5rem;
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
	margin-top: 0.25rem;
}

.champion-detail {
	display: flex;
	/* Establishes a flex container */
	justify-content: center;
	/* Centers children along the main axis (horizontal) */
	align-items: center;
	/* Centers children along the cross axis (vertical) */
	height: 100%;
	/* Ensures the container takes full height of its parent */
	text-align: center;
	/* Centers the text within the container */
}

.champion-image-container {
	display: flex;
	flex-direction: column;
	/* Aligns children (image and text) in a vertical stack */
}

.champion-image {
	max-width: 150px;
	/* Ensures the image is not larger than its container */
	max-height: 150px;
	/* Ensures the image does not exceed the container height */
	object-fit: contain;
	/* Ensures the image maintains aspect ratio without being cropped */
}


.blue-theme .champion-image {
	border-radius: 50%;
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
	width: 150px;
	height: 150px;
	overflow: hidden;
	border: 3px solid var(--red-laser-1);
	position: relative;
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
}</style>
