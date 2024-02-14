<template>
    <div class="filter-bar d-flex ">
        <!-- <input type="text" v-model="searchQuery" placeholder="Search Champions..." @input="onSearch" /> -->
        <button class="btn button" @click="toggleFavorites">{{ showFavorites ? 'Hide Favorites' : 'Show Favorites' }}</button>
        <button class="btn button" @click="emitSortRequest">Top Rated</button>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';

const emit = defineEmits(['update:filter']);
const searchQuery = ref('');
const showFavorites = ref(false);

const onSearch = () => {
    emit('update:filter', { type: 'search', value: searchQuery.value });
};

const toggleFavorites = () => {
    showFavorites.value = !showFavorites.value;
    emit('update:filter', { type: 'favorites', value: showFavorites.value });
};

const emitSortRequest = () => {
    emit('update:filter', { type: 'rating' });
};
</script>

<style>

.filter-bar button {
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    font-size: .875rem;
    transition: background-color 0.3s;
    transition: color 0.3s;
    color: #6C757D;
}

.filter-bar button:hover {
    color: var(--gold-1);
}

.filter-bar input {
    padding: 0.5rem 1rem;
    border: none;
    background-color: #f5f5f5;
    transition: background-color 0.3s;
}

.filter-bar input:focus {
    background-color: #e0e0e0;
}

.filter-bar input::placeholder {
    color: #a0a0a0;
}

.filter-bar input:focus::placeholder {
    color: #808080;
}

.filter-bar input {
    flex-grow: 1;
}

.filter-bar button {
    margin-left: 1rem;
}

</style>  