<template>
	<div class="container">
		<button @click="toggleModal" class="open-modal-button">Register</button>

		<div v-if="showModal" class="test-modal">
			<button @click="toggleModal" class="close-button">&times;</button>
			<form @submit.prevent="handleSubmit" class="auth-form">
				<input type="email" v-model="form.email" placeholder="Email" required>
				<input type="password" v-model="form.password" placeholder="Password" required>
				<input type="text" v-if="authMode === 'register'" v-model="form.username" placeholder="Username"
					required>
				<input type="password" v-if="authMode === 'register'" v-model="form.confirmPassword"
					placeholder="Confirm Password" required>
				<button type="submit" :disabled="isSubmitting">
					{{ authMode === 'login' ? 'Log In' : 'Create Account' }}
				</button>
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
		toggleModal();
		router.push('/championMatchup');
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