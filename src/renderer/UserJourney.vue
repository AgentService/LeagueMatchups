<template>
  <div class="app-wrapper">
    <div class="app-container">
      <div class="background-container">
        <!-- Background or thematic imagery can go here -->
      </div>
      <div class="grid-container">
        <div class="container-fluid">
          <!-- Header Row for Page Title or User Info -->
          <div class="row">
            <div class="col-12">
              <div class="page-header">
                <h1>Journey</h1>
                <!-- Optional: SummonerInfo Component if relevant -->
              </div>
            </div>
          </div>
          <!-- Main Content Row -->
          <div class="row justify-content-evenly">
            <!-- Sidebar for Filters and Progress Tracking -->
            <div class="col-xxl-3 col-xl-3">
              <div class="card">
                <LearningObjectives />
              </div>
              <div class="card">
                <h2 class="card-header-custom">Progress</h2>
                <!-- LearningObjectives with ProgressBar Component -->
              </div>
              <div class="card">
                <h2 class="card-header-custom">Reflections</h2>
                <!-- List of past reflections or quick links -->
              </div>
            </div>
            <!-- Main Content Area for Notes and Reflections -->
            <div class="col-xxl-9 col-xl-9">
              <div class="card">
                <!-- Consider adding an "Add Note" button here that opens a modal for note entry -->
              </div>
              <div class="card">
                <h2 class="card-header-custom">Weekly Reflection</h2>
                <!-- A space for writing and viewing weekly reflections -->
              </div>
              <div class="card">
                <MatchHistory />
                <!-- A space for writing and viewing weekly reflections -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import LearningObjectives from "./components/LearningObjectives.vue";
import MatchHistory from './components/MatchHistory.vue';

</script>

<style scoped>
.page-title {
  color: var(--primary-color);
  font-family: var(--font-family);
}

/* Add more styles specific to User Journey, but keep them consistent with the rest of the app */
</style>
