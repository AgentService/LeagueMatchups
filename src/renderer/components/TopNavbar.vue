<template>
  <div class="main-container">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid justify-content-start" style="max-width: 1280px;">
        <div class="d-flex position-relative justify-content-start">
          <!-- Loading spinner or dropdown based on summonerIcon's state -->
          <div v-if="!summonerIcon" class="spinner-grow text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <!-- Dropdown -->
          <div v-else class="dropdown">
            <button class="btn btn-dark dropdown-toggle" type="button" id="dropdownSummonerButton"
              data-bs-toggle="dropdown" aria-expanded="false">
              <div class="position-relative">
                <div class="position-relative icon-container">
                  <img :src="summonerIcon" alt="Summoner Icon" class="rounded-circle icon-image">
                  <span class="level-pill">{{ level }}</span>
                </div>
                <span class="ps-2 text-light">{{ riotIdParts.gameName }}</span>
                <span class="text-secondary">#{{ riotIdParts.tagLine }}</span>
              </div>
            </button>
            <!-- Dropdown Menu -->
            <div class="dropdown-menu animate-slide-in" aria-labelledby="dropdownSummonerButton">
              <div class="dropdown-header">Ranked Solo</div>
              <div class="dropdown-item">
                <div class="d-flex justify-content-between align-items-center">
                  <!-- Rank image on the left -->
                  <img src="/img/tier-icons/tier-icons-base/platinum.png" alt="Rank Image" class="rank-image">
                  <!-- Rank text on the right, above the progress bar -->
                  <div class="text-end flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="rank-text ms-0 mb-2">Platin 1</span>
                      <span class="lp-text  me-1 mb-2"><small>{{ lpPercentage }} LP</small></span>

                    </div>
                    
                    <!-- Progress Bar Component -->
                    <ProgressBar :value="lpPercentage"></ProgressBar>
                    <div class="d-flex justify-content-between">

                      <span class="win-rate-text ms-0 mt-2"><small>39.3% Win Rate</small></span>
                      <span class="win-loss-text  me-1 mt-2"><small>11S - 17N</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a class="navbar-brand me-auto ms-auto" href="#"></a>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import ProgressBar from "./utility/ProgressBar.vue";

const store = useStore();
const assetBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

// const accountData = computed(() => store.getters["summoner/accountData"]);
// const summonerData = computed(() => store.getters["summoner/summonerData"]);
const riotIdParts = computed(() => store.getters["summoner/riotIdParts"]);

const profileIconId = computed(() => store.getters["summoner/profileIconId"]);
const level = computed(() => store.getters["summoner/level"]);
const lpPercentage = computed(() => 79); // Assuming 79 LP for demonstration

const summonerIcon = computed(() => {
	const iconId = profileIconId.value;
	if (!iconId) {
		return undefined;
	}
	return `${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${iconId}.png`;
});
</script>

<style scoped>
/* Main container style */
.main-container {
  /* Gradient background */
  color: #f8f9fa;
  /* Whiteish text color for readability */
  border-radius: 0.5rem;
  /* Consistent rounded corners */
  padding: 1rem;
  max-height: 120px;
  /* Space inside the container */
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  /* Subtle shadow for depth */
}

.main-container>* {
  /* Direct children of main-container */
  background: linear-gradient(145deg, #1b2735 0%, #090a0f 100%);
  color: #c7d3dc;
  /* Light text for readability */
}




/* Text and other elements style inside the main container */
.main-container h1,
.main-container p {
  color: #f8f9fa;
  /* Text color */
}

.main-container .btn {
  background: linear-gradient(145deg, #3a3a6e50, #5656b957);
  /* Subtle gradient for buttons */
  border: none;
  color: #fff;
}

.main-container .btn:hover {
  background: linear-gradient(145deg, #3a3a6e, #5656b9);
  /* Keeps the gradient consistent on hover */
}

/* Styling to match the mockup */
/* Styling for navbar elements to match your design */
.navbar {
  background: var(--navbar-background-gradient);
  /* Set the background color to match the design */
}

/* Adjust colors and padding to match the mockup */
.navbar-brand {
  color: #fff;
}

.rank-text {
  /* ... other styles ... */
  font-weight: bold;
}

.win-rate-text {
  /* ... other styles ... */
  font-size: 0.85rem;
  align-self: flex-start; /* Aligns win rate to the left */
  /* Smaller font for win rate */
}
.win-loss-text {
  /* ... other styles ... */
  font-size: 0.85rem;
  /* Smaller font for win/loss record */
  align-self: flex-end; /* Aligns win/loss to the right */
}
.rank-image {
  width: 90px;
  /* Adjust width as needed */
  height: auto;
  /* Maintain aspect ratio */
  margin-right: 1rem;
  /* Space to the right of the image */
  /* Space around the image inside the border */
  box-sizing: border-box;
  /* Ensures padding is included in width/height */
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Container for the image and the level pill */
.icon-container {
  position: relative;
  display: inline-block;
  /* Or 'block' if you prefer */
  text-align: center;
  /* Helps center the pill if the container is wider than the image */
}

/* Adjust as needed */
.icon-image {
  width: 30px;
  height: 30px;
}

.lp-text {
  position: relative;
  color: #fff;
  background: transparent;
  z-index: 2;
  
  /* Ensures the text is above the progress bar's background */
}

/* Position the level pill directly below the image */
.level-pill {
  position: absolute;
  bottom: -10px;
  /* Adjust this value so the pill appears just below the image */
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #fff;
  padding: 0.25em 0.5em;
  /* Add padding around the text */
  border-radius: 10px;
  /* Rounded corners for the pill */
  background: var(--navbar-background-elements);
  /* Match the background color */
}


/* Dropdown styling */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-slide-in {
  animation: fadeIn 0.5s ease forwards;
}

.dropdown-menu {
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
  /* Subtle gradient for dropdown */
  color: #f8f9fa;
  /* Gradient background */
  border: none;
  border-radius: 0.5rem;
  /* Rounded corners */
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  /* Subtle shadow for depth */
  width: 350px;
  /* Width to give more space */
  margin-top: 0.5rem;
  padding: 1rem;
  /* Add padding inside the dropdown */
  border: 1px solid #3b83f61f;
  /* Add a border if you need one */
  margin-top: .5rem;
  /* Distance from the dropdown toggle button */
  box-shadow: 0 4px 8px rgba(0, 0, 0, .5);
  /* Shadow for depth, adjust as needed */
}

/* Dropdown item styling */
.dropdown-item {
  padding: 0.75rem;
  /* Padding for each item */
  /* Spacing between items */
  background: none;
  /* Clear any default background */
  border-radius: 0.25rem;
  /* Rounded corners for items */
}

.dropdown-item .flex-grow-1 {
  display: flex;
  flex-direction: column;
}
.dropdown-item,
.dropdown-header {
  /* Existing styles */
  font-size: 1rem;
  color: inherit;
  /* Inherits the whiteish text color from the dropdown-menu */
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: transparent;
  /* Disables the hover background change */
  color: inherit;
  /* Keeps the color consistent */
}


/* Custom progress bar to match the theme */
.progress {
  height: .5rem; /* Adjust the height to make the bar thinner */

  background-color: #0e0e10;
  /* Dark background for the progress bar */
  border-radius: 1rem;
  /* Rounded corners for the progress bar */
  align-self: flex-start; /* Aligns progress bar to the left */
  width: 100%; /* Ensures the progress bar stretches to the full width */
}


/* The rank and LP text styling */
.ranked-text {
  color: #a9a9a9;
  align-self: flex-start; /* Aligns 'Platin 1' to the left */

  /* Slightly muted text color for contrast */
  font-size: 0.9rem;
  /* Smaller text size for rank and LP information */
}</style>
