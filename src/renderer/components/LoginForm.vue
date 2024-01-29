<template>
	<div class="container">
		<div v-if="!isLoggedIn">
			<button @click="handleButtonClick" class="open-modal-button">Open Modal</button>
		</div>

		<div v-if="isLoggedIn">
			<!-- Show login status (email) here -->
			<!-- <p>{{ userEmail }}!</p> -->
			<button @click="logout" class="logout-button">Logout</button>
		</div>

		<div v-if="showModal" class="modal">
			<button @click="closeModal" class="close-button">&times;</button>
			<div v-if="!authLoading && isLoggedIn" class="greeting-message">
				{{ userEmail }}!
				<button @click="logout" class="logout-button">Logout</button>
			</div>
			<form v-else @submit.prevent="handleSubmit" class="login-form">
				<!-- Login form fields -->
				<div class="form-group">
					user@example.com
					password123
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
	</div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
const authLoading = computed(() => store.state.auth.loading);
const userEmail = computed(() => store.state.auth.user?.email);
const form = reactive({
	email: '',
	password: ''
});

const isSubmitting = ref(false);
const errorMessage = ref('');
const showModal = ref(false);

const handleButtonClick = () => {
	showModal.value = true;
};

const closeModal = () => {
	showModal.value = false;
};

const handleSubmit = async () => {
	isSubmitting.value = true;
	errorMessage.value = '';

	try {
		await store.dispatch('auth/login', {
			email: form.email,
			password: form.password
			// Additional fields if needed
		});
		// Close modal on successful login
		closeModal();
	} catch (error) {
		errorMessage.value = error.message || 'Failed to login';
	} finally {
		isSubmitting.value = false;
	}
};

const logout = () => {
	store.dispatch('auth/logout');
	// Handle logout process (like redirecting to the login page)
};
</script>

<style scoped>
.modal {
	display: block;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: rgba(0, 0, 0, 0.95);
	/* Semi-transparent background */
	z-index: 1000;
	/* Adjust the z-index as needed */
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	/* Add a subtle box shadow */
	text-align: center;
	/* Center the contents horizontally */
}

.close-button {
	position: absolute;
	top: 10px;
	right: 40px;
	background: none;
	border: none;
	font-size: 64px;
	color: #fff;
	cursor: pointer;
}

/* Vertically center the login form within the modal using vh */
.login-form {
	background-color: var(--navbar-background-elements);
	padding: 50px;
	border-radius: 8px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.form-group {
	margin-bottom: 15px;
	width: 100%;
	/* Make the form groups full width */
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