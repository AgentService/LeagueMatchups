<template>
  <div class="container">
    <div v-if="isLoggedIn" class="greeting-message">
      Hello, {{ userName }}!
      <select>
        <option>{{ userEmail }}</option>
      </select>
      <button @click="logout" class="logout-button">Logout</button>
    </div>
    <form v-else @submit.prevent="handleSubmit" class="login-form">
      <!-- Login form fields -->
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="form.email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="form.password" required>
      </div>
      <button type="submit" :disabled="isSubmitting" class="submit-button">Login</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
const userEmail = computed(() => store.state.auth.user?.email);
const userName = computed(() => store.state.auth.user?.name);

const form = reactive({
  email: '',
  password: '',
  isSubmitting: false,
  errorMessage: ''
});

const handleSubmit = async () => {
  form.isSubmitting = true;
  form.errorMessage = '';

  try {
    await store.dispatch('auth/login', {
      email: form.email,
      password: form.password,
      // riotId: form.riotId,
      // tag: form.tag
    });
    // Handle successful login
  } catch (error) {
    form.errorMessage = error.message || 'Failed to login';
  } finally {
    form.isSubmitting = false;
  }
};

const logout = () => {
  store.dispatch('auth/logout');
  // Handle logout process (like redirecting to login page)
};
</script>

<style scoped>
.login-form {
  z-index: 10;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button,
.logout-button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

.logout-button {
  background-color: #dc3545;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
}

.container {
  max-width: 600px;
  text-align: center;
}

.greeting-message {
  font-size: 20px;
}
</style>
