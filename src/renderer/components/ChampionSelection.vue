<template>
  <div :class="[themeClass, 'note-card', 'gradient-border', 'card', 'text-light']">

    <div class="champion-card d-flex align-items-center justify-content-center">

      <div class="champion-selector w-100">
        <div class="search-popover-container position-relative">
          <div v-if="isDropdownOpen" class="champion-popover position-absolute">
            <input v-model="searchTerm" @input="filterChampions" @focus="isDropdownOpen = true" placeholder="Search..."
              class="form-control" />

            <div v-for="champion in filteredChampions" :key="champion.id" class="champion-option d-flex align-items-center
                                        p-2" @click="selectChampion(champion)">
              <!-- Use v-lazy instead of :src for lazy loading -->
              <img v-lazy="getChampionImageSource('small', champion.id)" class="img-fluid me-2" alt="Champion Image" />
              <span>{{ champion.name }}</span>
            </div>
          </div>
        </div>
        <div class="champion-display d-flex align-items-center flex-column  justify-content-between">
          <div class="lo-title align-items-center">
            <!-- <h3>{{ selectedChampion.id }}</h3> -->
          </div>
          <div class="champion-display">
            <div :class="[themeClass, 'champion-image-container']">
              <img ref="elementToAnimate" class="champion-image "
                :src="selectedChampion ? getChampionImageSource('tiles', selectedChampion.id) : '/img/champions/placeholder.png'"
                @click="isDropdownOpen = true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { ref, onMounted } from "vue";
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
			selectedChampion: "",
			selectedChampions: [], // Initialize empty array
			isDropdownOpen: false // A mystical gatekeeper that controls the visibility of the dropdown

		};
	},
	mounted() {
		const store = useStore();

		// Dispatch the action to fetch champion data
		debug("Fetching champion data...");
		store.dispatch("champions/fetchChampionData").then(() => {
			const listChampionsData = store.state.champions.championList;
			// const detailedChampionsData = store.state.champions.championDetails;
			// Process the data as needed for this component
			const championsArray = Object.values(listChampionsData).map(champ => champ);
			this.filteredChampions = [...championsArray];

			// Determine and select a preselected champion based on instanceId
			const preselectedChampion = this.instanceId === 1 ? championsArray[1] : championsArray[2];
			this.selectChampion(preselectedChampion);
		}).catch(error => {
			console.error("Error fetching champions:", error);
		});
	},


	methods: {
		filterChampions() {
			this.filteredChampions = this.champions.filter(champion =>
				champion.toLowerCase().startsWith(this.searchTerm.toLowerCase())
			);
		},
		selectChampion(champion) {
			this.selectedChampion = champion;
			debug("Selected champion:", this.selectedChampion);
			this.searchTerm = ""; // Clears the search field, bestowing it with a fresh start
			this.$emit("championSelected", this.selectedChampion);
			this.closeDropdown();

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
		backgroundStyle() {
			return this.selectedChampion ?
				{
					backgroundImage: `url(${this.getChampionImageSource("splash", this.selectedChampion.id)})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					backgroundColor: "rgba(0, 0, 0, 0.7)", // Adding a semi-transparent black background
					backgroundBlendMode: "multiply", // Blending the background image with the background color
				} : {};
		},
		themeClass() {
			return this.instanceId === 1 ? "blue-theme" : "red-theme";
		},
	},
};
</script>

<style scoped>
.note-card {
  /*background-color: rgba(0, 0, 0, 0.7); /* Adjust the alpha for transparency */
  padding: 1rem;
  color: #fff;
  height: 100%;
  font-family: 'Your Font', sans-serif;
  /* Replace 'Your Font' with your actual font */
}

.champion-image-container {}


.champion-display {
  height: 100%;
  display: flex;
}


.search-input {
  position: relative;
  width: 100%;
  border: none;
  border-radius: 4px;
}

.search-popover-container {
  left: 0;
  max-height: 0px;
  position: absolute;
  width: 100%;
  /* Take the full width of the parent */
  z-index: 1;
  /* Ensure it appears above other elements if there's overlap */
}


.champion-popover {
  width: 100%;
  /* Make the popover take up the full width of the parent */
  top: 130px;
  /* Position the popover 20px below the input */
  position: absolute;
  color: white;
  border-bottom: 1px solid #2d3748;
  transition: width 0.3s ease;
  /* Adding a transition for smooth expansion */
  background-color: #1a202c;
  border: 1px solid #2d3748;
  max-height: 300px;
  overflow-x: hidden;
  /* Ensuring the popover is scrollable if content overflows */
}


.champion-option {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
}

.champion-option img {
  width: 30px;
  height: auto;
  margin-right: 0.5rem;
}


.blue-theme .champion-image {
  display: block;
  border-radius: 50%;
  width: 150px;
  height: 150px;
  overflow: hidden;
  /* To clip the pseudo-element within the circular shape */
  /* border: 2px solid var(--blue-laser-1); */
  position: relative;
}

.red-theme .champion-image {
  display: block;
  border-radius: 50%;
  width: 150px;
  height: 150px;
  overflow: hidden;
  /* To clip the pseudo-element within the circular shape */
  /* border: 2px solid var(--blue-laser-1); */
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
</style>
