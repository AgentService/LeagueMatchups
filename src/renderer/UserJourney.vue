<template>
  <div class="app-container">
    <h1 class="page-title">User Journey</h1>
    <!-- Content specific to User Journey -->
  </div>
  <div class="app-wrapper">
    <div class="app-container">
      <div class="background-container gradient-top-border ">
      </div>
      <div class="grid-container">
        <div class="row slim-row">
          <div class="col-md-3 h-100 ">
            
          </div>
          <div class="col-md-9">
            <div class="row ">
              <div class="col-md-6 d-flex flex-column h-100   gradient-border ">
              </div>
              <div class="col-md-3 d-flex flex-column h-100  gradient-border ">
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3 h-100 ">
          </div>
          <div class="col-md-9">
            <div class="row ">
              <div class="col-md-6 d-flex flex-column h-100   gradient-border ">
              </div>
              <div class="col-md-3 d-flex flex-column h-100  gradient-border ">
              </div>
            </div>
          </div>
        </div>
        <!-- Second Row -->
        <div class="row">
          <div class="col-md-3 d-flex align-items-stretch gradient-top-border">
            <LearningObjectives></LearningObjectives>
          </div>
          <div class="col-md-6 d-flex flex-column align-items-stretch ">
            <div class="row">
              <div class="col-md-6 gradient-border h-100">
              </div>
              <div class="col-md-6 gradient-border h-100">
              </div>
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-stretch gradient-border ">
          </div>
        </div>
        <div class="row ">
          <div class="col-md-3 gradient-border ">
          </div>
          <div class="col-md-6">
            <div class="row">
              <div class="col-md-2 gradient-border ">
              </div>
              <div class="col-md-8  gradient-top-border ">
              </div>
              <div class="col-md-2  gradient-border ">
              </div>
            </div>
          </div>
          <div class="col-md-3">
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import LearningObjectives from "./components/LearningObjectives.vue";
</script>

<style scoped>
.page-title {
  color: var(--primary-color);
  font-family: var(--font-family);
}

/* Add more styles specific to User Journey, but keep them consistent with the rest of the app */
</style>
