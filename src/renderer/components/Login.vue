<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="email" required>
    </div>
    <div>
      <label for="password">Password:</label>
      <input type="password" id="password" v-model="password" required>
    </div>
    <button type="submit">Login</button>
  </form>
</template>
  
<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  await store.dispatch('auth/login', {
    email: email.value,
    password: password.value
  });
  // Handle the response, like redirecting the user
};
</script>
  
<style scoped>
/* Add your CSS styling here */
</style>
  