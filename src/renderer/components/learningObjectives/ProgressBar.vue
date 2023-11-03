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
    background-color: #ddd;
    border-radius: 5px;
  }
  
  .progress-bar {
    height: 20px;
    background-color: #4c53af;
    border-radius: 5px;
  }
  </style>
  