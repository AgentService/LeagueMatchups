<template>
  <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #0d1017;">
    <!-- Container to limit the width of the content -->
    <div class="container-fluid" style="max-width: 1280px;">
      <!-- Brand/logo -->
      <a class="navbar-brand" href="#">
        Improve
      </a>

      <!-- Toggler/collapsible Button for mobile views -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar content -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <div class="ms-auto position-relative">
          <!-- Dropdown Trigger -->
          <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img :src="summonerIcon" alt="Summoner Icon" class="rounded-circle summoner-icon me-2">
            <span>{{ summonerName }}</span>
          </a>
          <!-- Dropdown Menu -->
          <div class="dropdown-menu dropdown-menu-end p-3 bg-dark text-color-custom" aria-labelledby="navbarDropdown">
            <!-- Dropdown content -->
            <div class="d-flex align-items-center">
              <img :src="summonerIcon" alt="Profile Icon" class="rounded-circle me-2 summoner-icon">
              <span>Level {{ level }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item text-white">Ranked Solo</div>
            <div class="dropdown-item">
              <div class="d-flex justify-content-between">
                <span>Platin 1</span>
                <span>79 LP</span>
              </div>
              <ProgressBar :value="lpPercentage" />
            </div>
            <div class="dropdown-item">
              <div class="d-flex justify-content-between">
                <span>39.3% Win Rate</span>
                <span>11S - 17N</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>


<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ProgressBar from './utility/ProgressBar.vue';

const store = useStore();
const assetBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

const summonerName = computed(() => store.state.playerDetails.accountData.gameName + '#' + store.state.playerDetails.accountData.tagLine);
console.log(store.state);
const profileIconId = computed(() => store.state.playerDetails.summonerData.profileIconId);
const summonerIcon = computed(() => `${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${profileIconId.value}.png`);
const level = computed(() => store.state.playerDetails.summonerData.summonerLevel);
const lpPercentage = computed(() => 79); // Assuming 79 LP for demonstration
</script>


<style scoped>
/* Styling to match the mockup */
/* Styling for navbar elements to match your design */
.navbar {
  background-color: #0d1017; /* Set the background color to match the design */
}

/* Adjust colors and padding to match the mockup */
.navbar-brand {
  color: #fff;
}
.text-color-custom {
  color: var(--gold-2); /* Replace with your desired color code */
}

/* If the dropdown contains links, you might also need to style them */
.text-color-custom span {
  color: var(--gold-2); /* Replace with your desired color code */
  text-decoration: none; /* Optional: removes underline from links */
}

.text-color-custom a:hover {
  color: var(--gold-2); /* Replace with your desired color code */
}
.navbar-toggler {
  /* Custom styles for mobile toggle button */
}
.summoner-icon {
  width: 30px; /* Adjust to the size you want */
  height: 30px; /* Adjust to the size you want */
  /* Ensure the image remains circular */
  border-radius: 50%;
}

/* Ensure dropdown opens directly below the button */
.dropdown-menu {
  position: absolute; /* Use absolute positioning */
  transform: translate3d(0, 10px, 0); /* Adjust Y coordinate as needed */
}
/* More styles... */</style>
