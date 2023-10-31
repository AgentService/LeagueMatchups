<template>
  <div>
    <div v-for="champion in champions" :key="champion.key">
      <img
        :src="getChampionImageSource(champion.id)"
        alt="Champion Image"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      champions: [],
    };
  },
  mounted() {
  axios.get('http://localhost:3001/api/champions')
    .then(response => {
      // Update this line if the data format has changed
      this.champions = response.data.data;
    })
    .catch(error => {
      console.error('Error fetching champions:', error);
    });
},
  methods: {
    getChampionImageSource(championId) {
      return `/img/champions/${championId}.png`;
    },
  },
};
</script>
