<template>
  <div class="card-top">
    <span>Ranked Solo</span>
  </div>
  <div class="card-bottom">
    <div class="d-flex justify-content-between align-items-center">
      <!-- Rank image on the left -->
      <!-- <img src="/img/tier-icons/tier-icons-base/platinum.png" alt="Rank Image" class="rank-image" /> -->
      <div class="text-end flex-grow-1">
        <div class="d-flex justify-content-between align-items-center">
          <span class="rank-text ms-0 mb-2">{{ rank }}</span>
          <span class="lp-text me-1 mb-2"><small>{{ lpPercentage }} LP</small></span>
        </div>

        <!-- Progress Bar Component -->
        <ProgressBar :value="lpPercentage"></ProgressBar>
        <div class="d-flex justify-content-between">
          <span class="win-rate-text ms-0 mt-2"><small>{{ winRate }} Win Rate</small></span>
          <span class="win-loss-text me-1 mt-2"><small>{{ gamesWon }}S - {{ gamesLost }}N</small></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const riotIdParts = computed(() => store.getters["summoner/riotIdParts"]);
const profileIconId = computed(() => store.getters["summoner/profileIconId"]);
const level = computed(() => store.getters["summoner/level"]);


</script>

<style scoped>
.rank-image {
  width: 80px;
  box-sizing: border-box;
}
</style>
