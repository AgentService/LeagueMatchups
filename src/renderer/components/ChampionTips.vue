<template>
  <div class="container mt-3 d-flex" v-if="championTips && Object.keys(championTips).length > 0">
    <!-- <h2>{{ championName }}'s Tips</h2> -->
    <!-- Buttons with hints as a second line -->
    <div v-for="(keys, groupName) in groupedTips" :key="groupName" class="mb-3">
      <button type="button" class="btn btn-primary btn-block" data-bs-toggle="modal"
        :data-bs-target="'#modal-' + groupName + '-' + instanceId">
        <div class="button-content">
          <i :class="getIconForCategory(groupName)" aria-hidden="true"></i>
          <div class="text-content text-center">
            <!-- <small class="d-block text-white-50">{{ getSubCategoryHints(keys) }}</small> -->
            {{ groupName }}
          </div>
        </div>
      </button>
    </div>

    <!-- Modals for each group with instanceId -->
    <div v-for="(keys, groupName) in groupedTips" :key="'modal-' + groupName + '-' + instanceId" class="modal fade"
      :id="'modal-' + groupName + '-' + instanceId" tabindex="-1"
      aria-labelledby="'modal-' + groupName + '-' + instanceId + '-label'" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="'modal-' + groupName + '-' + instanceId + '-label'">{{ groupName }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">

            <div v-for="tipKey in keys" :key="tipKey">
              <h5>{{ formatCategory(tipKey) }}</h5>
              <p>{{ championTips[tipKey]?.long }}</p>
            </div>
            <div v-if="groupName === 'Character' && championTips['additionalInsights']">
              <h5>Additional Insights</h5>
              <div v-for="(info, key) in championTips['additionalInsights']" :key="key">
                <h6>{{ formatCategory(key) }}</h6>
                <p>{{ info }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineProps, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  champion: Object,
  instanceId: Number
});

const store = useStore();
const championId = ref(props.champion?.id);
const championName = computed(() => props.champion?.name);
const groupedTips = {
  'Overview': ['strengths', 'weaknesses', 'counterplay'],
  'Gameplan': ['earlyGame', 'midGame', 'lateGame', 'teamFightRole'],
  'Mindset': ['identity', 'mindsetAndPsychology']
};
const championTips = computed(() => {
  return store.getters['champions/getChampionTips'](championId.value);
});

const formatCategory = (key) => {
  if (!key) return '';
  key = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  key = key.replace(/^\w|\s\w/g, (str) => str.toUpperCase());
  return key.trim();
};

const getIconForCategory = (category) => {
  const icons = {
    'Gameplan': 'fa-solid fa-chess',
    'Overview': 'fa-solid fa-magic',
    'Mindset': 'fa-solid fa-user',
    // Define more icons for other categories if needed
  };
  return icons[category] || 'fa-solid fa-question-circle'; // Fallback icon
};

console.log(championTips.value);
watch(() => props.champion, (newChampion) => {
  if (newChampion && newChampion.id !== championId.value) {
    championId.value = newChampion.id;
  }
}, { immediate: true });

</script>


<style>

.btn small {
  color: aliceblue;
  font-size: 0.65em;
  /* Smaller font size for hints */
  opacity: 0.75;
  /* Slightly transparent for less prominence */
}
.modal-dialog {
  max-width: 90%;
  z-index: 9999;

  background-color: yellowgreen;
}
.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.button-content i {
  margin-bottom: 10px; /* Adjust the margin as needed */
}

.text-content {
  text-align: center;
}

.button-content .text-content {
  display: flex;
  flex-direction: column;
  align-items: start;
}

.modal-body {
  background: linear-gradient(145deg, #1b2735 0%, #090a0f 100%);
  color: #c7d3dc;
}
.modal-content {
  color: #f8f9fa;
}
.modal-header {
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
  color: #f8f9fa;
}
.modal-header .btn {
  background: linear-gradient(145deg, #3a3a6e50, #5656b957);
  /* Subtle gradient for buttons */
  border: none;
  color: #fff;
}

</style>