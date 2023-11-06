<template>
    <div>
      <button @click="fetchAndDisplayChampionData">Load Champion Data</button>
      <p v-if="championData">Champion Data: {{ championData.name }}</p>
    </div>
  </template>
  
  <script>
  import { mapActions, mapState } from 'vuex';
  
  export default {
    computed: {
      ...mapState('champions', ['data']),
  
      // This computed property will be used to display champion data in the template
      championData() {
        return this.data ? this.data['Aatrox'] : null; // Example: Access a single champion's data
      },
    },
    methods: {
      ...mapActions('champions', ['fetchChampionData']),
  
      fetchAndDisplayChampionData() {
        this.fetchChampionData();
      },
    },
  };
  </script>