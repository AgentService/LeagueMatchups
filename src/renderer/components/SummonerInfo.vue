<template>
  <div class="summoner-widget d-flex flex-column w-100 p-3  m-4 rounded ">
    <div class="row">
      <div class="col-3 col-md-5">
        <div class="position-relative icon-container">
          <img :src="`${assetBaseUrl}/dragontail/13.21.1/img/profileicon/${profileIconId}.png`" alt="Profile Icon" class="summoner-icon rounded-circle">
          <div class="summoner-level position-absolute start-50 translate-middle-x bg-dark text-white rounded-pill px-2 py-1" style="bottom: -10px;">{{ level }}</div>
        </div>
      </div>
      <div class="col-4 col-md-7 d-flex align-items-center justify-content-start">
          <h4 class="summoner-name mb-0">{{ name }}</h4>
      </div>
    </div>
    <div class="row mt-4">
      <div class="text-start">
          <h6 class="summoner-queue  mb-0">Ranked Solo</h6>
        </div>
    </div>
    <div class="row mt-0">
      <!-- LP and WR Section -->
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <div class="winrate-title text-light">Platin 1</div>
          <div class="lp-title text-secondary">79 LP</div>
        </div>
        <!-- Progress Bar Component -->
        <ProgressBar :value="lpPercentage" />

        <div class="d-flex justify-content-between align-items-center mt-1">
          <div class="winrate-value text-secondary">39.3% Win Rate</div>
          <div class="lp-value text-secondary">11S - 17N</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import ProgressBar from "./utility/ProgressBar.vue";

const assetBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
const store = useStore();
const name = computed(() => store.state.summonerData?.name);
const profileIconId = computed(() => store.state.summonerData?.profileIconId);
const level = computed(() => store.state.summonerData?.summonerLevel);
const lpPercentage = computed(() => 79); // Assuming 79 LP for demonstration

onMounted(async () => {
	console.log("SummonerInfo mounted");
	await store.dispatch("summonerData/getSummonerData");
});

</script>

<style scoped>
.summoner-widget {
  /* background: #0d1017; */
  color: #fff;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.summoner-icon {
  width: 100%; /* Adjust size as needed */
  max-width: 120px; /* Adjust size as needed */
  height: auto;
}



.summoner-level {
  /* Position at the bottom center of the image */
  bottom: 0;
  left: 50%;
}

.summoner-queue {
  color: var(yellow-300);
  font-weight: bold;
}

.summoner-stats {
  width: 100%;
}



.rank-title,
.lp-title,
.winrate-title {
  font-size: var(--bs-font-size-base);
  color: #bbb;
  font-weight: bold;

}

.rank-value,
.lp-value,
.winrate-value {
  font-size: var(--bs-font-size-base);
}
</style>
