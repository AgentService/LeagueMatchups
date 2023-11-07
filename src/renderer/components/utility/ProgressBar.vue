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
  width: 100%; /* Full width of the parent element */
  background-color: #0e0e10; /* Dark background for the container */
  border-radius: .5rem; /* Rounded corners for the container */
  height: .6rem; /* Height of the container */
  overflow: hidden; /* Ensures the inner bar doesn't overflow */
}

.progress-bar {
  background-color: #4e0ecc; /* Color for the progress bar fill */
  height: 100%; /* Full height of the container */
  width: 0; /* Initial width, will be set by Vue binding */
}
  </style>
  