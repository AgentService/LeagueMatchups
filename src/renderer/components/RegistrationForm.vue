<template>
	<div class="container">
		<button @click="toggleModal" class="open-modal-button">Register</button>

		<div v-if="showModal" class="test-modal">
			<button @click="toggleModal" class="close-button">&times;</button>
			<form @submit.prevent="handleSubmit" class="registration-form">
				<div class="form-group">
					<label for="reg-email">Email:</label>
					<input type="email" id="reg-email" v-model="form.email" required>
				</div>
				<div class="form-group">
					<label for="reg-username">Username:</label>
					<input type="text" id="reg-username" v-model="form.username" required>
				</div>
				<div class="form-group">
					<label for="reg-password">Password:</label>
					<input type="password" id="reg-password" v-model="form.password" required>
				</div>
				<div class="form-group">
					<label for="reg-confirm-password">Confirm Password:</label>
					<input type="password" id="reg-confirm-password" v-model="form.confirmPassword" required>
				</div>
				<button type="submit" :disabled="isSubmitting" class="submit-button">Register</button>
				<p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
			</form>
		</div>
	</div>
</template>
<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';

const showModal = ref(false);
const form = ref({
	email: '',
	password: '',
	confirmPassword: '',
	username: '', // Add this line
});
const errorMessage = ref('');
const isSubmitting = ref(false);
const store = useStore();

const toggleModal = () => {
	console.log("toggleModal called");

	showModal.value = !showModal.value;
};

const handleSubmit = async () => {
	if (form.value.password !== form.value.confirmPassword) {
		errorMessage.value = "Passwords do not match.";
		return;
	}

	isSubmitting.value = true;
	try {
		const response = await store.dispatch('auth/register', {
			email: form.value.email,
			username: form.value.username, // Ensure this is sent correctly
			password: form.value.password,
		});
		toggleModal(); // Close the registration modal upon successful registration
		form.value = { email: '', username: '', password: '', confirmPassword: '' };
		errorMessage.value = '';
	} catch (error) {
		errorMessage.value = "Registration failed. Please try again.";
	} finally {
		isSubmitting.value = false;
	}
};

</script>

  
<style scoped>
/* Add your modal and form styling here */
.test-modal {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: white;
	z-index: 1000;
	padding: 20px;
}


.close-button {
	/* Close button styles */
}

.submit-button {
	/* Submit button styles */
}

.error-message {
	/* Error message styles */
}
</style>
  