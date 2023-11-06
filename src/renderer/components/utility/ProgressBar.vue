<template>
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      progress() {
        return Math.min(Math.max(this.value, 0), 100);
      },
    },
  };
  </script>
  
  <style scoped>
.progress-bar-container {
  background-color: #0e1726; /* New background color */
  border: 1px solid #1f2a3f; /* Border color */
  border-radius: 10px; /* More pronounced border-radius for rounded edges */
  height: 10px; /* Thinner height for the progress bar container */
  overflow: hidden; /* Ensures the inner bar stays within the border-radius */
}

.progress-bar {
  height: 100%; /* Make the inner bar fill the container height */
  background-color: var(--blue-laser-1); /* Preserving the original bar color */
  /* Maintain the border-radius for the inner bar, if it's filled */
  border-radius: 8px 0 0 8px; /* Rounded on the left side only; adjust as needed */
}
  </style>
  