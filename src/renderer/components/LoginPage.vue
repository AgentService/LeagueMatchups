<template>
    <div class="auth-container">
        <div class="background-image-container" :style="championBackgroundStyle">
            <div class="background-overlay"></div> <!-- Overlay added here -->
        </div>
        <transition name="fade">

            <div class="auth-container">
                <div class="auth-card" v-if="!showDirectoryPicker">
                    <div class="auth-header">
                        <!-- <span v-if="authMode === 'login'">Already a member? Log In</span>
                <span v-else>Start for free</span> -->
                        <h2>{{ authMode === 'login' ? 'Login' : 'Register' }}</h2>
                        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                    </div>
                    <form @submit.prevent="handleSubmit" class="auth-form">
                        <input type="email" v-model="form.email" placeholder="Email" required>
                        <input type="text" v-if="authMode === 'register'" v-model="form.username" placeholder="Username"
                            required>
                        <input type="password" v-model="form.password" placeholder="Password" required>
                        <input type="password" v-if="authMode === 'register'" v-model="form.confirmPassword"
                            placeholder="Confirm Password" required>
                        <button class="button-login" type="submit" :disabled="isSubmitting">
                            {{ authMode === 'login' ? 'Log In' : 'Create Account' }}
                        </button>
                    </form>
                    <button @click="toggleAuthMode" class="toggle-auth-mode">
                        {{ authMode === 'login' ? 'Need an account? Register' : 'Already A Member? Log In' }}
                    </button>
                </div>
            </div>
        </transition>

    </div>
</template>


<script setup>
import { reactive, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getUrlHelper } from '../globalSetup';

const router = useRouter();
const store = useStore();
const form = reactive({
    email: 'markusromaniw@gmx.de',
    password: '',
    username: '', // Only for registration
    confirmPassword: '' // Only for registration
});
const authMode = ref('login');
const isSubmitting = ref(false);
const errorMessage = ref('');
const showDirectoryPicker = ref(false);

const isLoggedIn = computed(() => store.state.auth.isLoggedIn);

const championBackgroundStyle = computed(() => {
    const urlHelper = getUrlHelper();
    const imageUrl = urlHelper.getChampionImageSource('splash', 'Ahri');

    return {
        backgroundImage: `url('${imageUrl}')`,
        opacity: 1
    };
});

const toggleAuthMode = () => {
    authMode.value = authMode.value === 'login' ? 'register' : 'login';
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        if (authMode.value === 'register' && form.password !== form.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        if (authMode.value === 'login' || (authMode.value === 'register' && form.password === form.confirmPassword)) {
            // Attempt login or registration
            await store.dispatch(authMode.value === 'login' ? 'auth/login' : 'auth/register', form);
            router.replace('/ChampionPage');
        } else {
            throw new Error('Passwords do not match');
        }
    } catch (error) {
        errorMessage.value = error.message;
    } finally {
        isSubmitting.value = false;
    }
};
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.background-image-container {
    position: absolute;
    /* Ensure the container can hold the pseudo-element */
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: bottom right;
    background-repeat: no-repeat;
    z-index: -1;
    /* Ensure it's behind other content */
}

.background-image-container::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgb(4, 8, 12, 0.7) 10%, rgb(4, 8, 12, 0.9) 20%, rgb(4, 8, 12) 80%);
    z-index: -1;
}


.auth-container,
.directory-picker {
    color: var(--gold-1);
    z-index: 0;
}

.auth-card {
    min-width: 400px;
}

.auth-card,
.directory-picker {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 0;
    background: var(--card-background);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

input {
    border: 1px solid var(--border-grey-gradient-horizontal);
    background-color: #091014;
    color: var(--gold-1);
}

.toggle-auth-mode {
    color: var(--navbar-background-elements);
}

.directory-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto;
    max-width: 400px;
    padding: 3rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 1);
    border: 1px solid var(--grey-3);
}

.auth-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.auth-card {
    width: 100%;
    max-width: 400px;
    padding: 40px;
    border-radius: 10px;
    border: 1px solid var(--grey-3);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 1);
}

.auth-header {
    text-align: center;
    margin-bottom: 20px;
}

.dir-header {
    text-align: center;
}

.auth-header h5 {
    margin-bottom: 20px;
}

.instruction-text,
.helper-text {
    text-align: justify;
    font-size: 1rem;
    margin-bottom: 1rem;
    margin-top: .5rem;
    color: var(--grey-1);
}

.error-message {
    margin: 20px 0;
    color: #d32f2f;
    font-weight: bold;
}

.locate-directory-btn {
    background-color: #007bff;
    color: #ffffff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.locate-directory-btn:hover {
    background-color: #0056b3;
}

.helper-text a {
    color: #007bff;
    text-decoration: underline;
}

.helper-text a:hover {
    color: #0056b3;
}

/* Adjustments for accessibility */
.locate-directory-btn:focus,
.helper-text a:focus {
    outline: 2px solid #0056b3;
    outline-offset: 2px;
}

h2 {
    margin-bottom: 20px;
    text-align: center;
    color: #333;
    /* Adjust to match design */
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

input {
    padding: 15px;
    border-radius: 5px;
    border: 1px solid #ddd;
    font-size: 16px;
}



button:disabled {
    background-color: #cccccc;
}

.toggle-auth-mode {
    margin-top: 20px;
    background: none;
    color: #0056b3;
}

.error-message {
    color: red;
    text-align: center;
}
</style>
