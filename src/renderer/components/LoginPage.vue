<template>
    <div class="auth-container" v-if="!showDirectoryPicker">
        <div class="auth-card">
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
                <button type="submit" :disabled="isSubmitting">
                    {{ authMode === 'login' ? 'Log In' : 'Create Account' }}
                </button>
            </form>
            <button @click="toggleAuthMode" class="toggle-auth-mode">
                {{ authMode === 'login' ? 'Need an account? Register' : 'Already A Member? Log In' }}
            </button>
        </div>
    </div>
    <div class="directory-picker" v-if="showDirectoryPicker">
        <div class="auth-header">
            <h3>Please locate your League of Legends directory path.</h3>
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </div>
        <button @click="proceedToSelectDirectory">Locate Directory</button>
    </div>
</template>


<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import router from '../router'; // Adjust based on your file structure

const store = useStore();
const form = reactive({
    email: 'markusromaniw@gmx.de',
    password: '123',
    username: '', // Only for registration
    confirmPassword: '' // Only for registration
});
const authMode = ref('login');
const isSubmitting = ref(false);
const errorMessage = ref('');

const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
const showDirectoryPicker = ref(false);

onMounted(async () => {
    debugger
    if (isLoggedIn.value) {
        const pathExists = await window.api.checkLeagueClientPathExists();
        showDirectoryPicker.value = !pathExists;
    }
});

const checkLeagueClientPath = async () => {
    debugger
    const pathExists = await window.api.checkLeagueClientPathExists();
    if (!pathExists) {
        showDirectoryPicker.value = true;
    } else {
        // Proceed if the path already exists
        router.push('/championMatchup');
    }
};

// Handle directory selection
const proceedToSelectDirectory = () => {
    window.api.openPathDialog();
};

window.api.receive("directory-path-selected", (data) => {
    const { leagueClientPath } = data;
    if (leagueClientPath) {
        console.log("Valid directory selected:", leagueClientPath);
        router.replace('/championMatchup');
    } else {
        console.error("No valid directory found.");
        // Handle error or retry logic
    }
});

const toggleAuthMode = () => {
    authMode.value = authMode.value === 'login' ? 'register' : 'login';
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        debugger
        if (authMode.value === 'login' || (authMode.value === 'register' && form.password === form.confirmPassword)) {
            // Attempt login or registration
            await store.dispatch(authMode.value === 'login' ? 'auth/login' : 'auth/register', form);
            await checkLeagueClientPath(); // Check for the League client path after successful auth
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


<style>
/* Update existing CSS rules to incorporate the app's color scheme */
.auth-container,
.directory-picker {
    color: var(--gold-1);
    background: var(--background-1-gradient);
}

.auth-card,
.directory-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--card-background);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

button:disabled {
    background-image: var(--border-grey-gradient-horizontal);
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
    width: 100%;
    max-width: 400px;
    margin: auto;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.auth-container {
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
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.auth-header {
    text-align: center;
    margin-bottom: 20px;
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

button {
    padding: 15px;
    border-radius: 5px;
    border: none;
    background-color: #0056b3;
    /* Adjust to match design */
    color: white;
    font-size: 16px;
    cursor: pointer;
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
