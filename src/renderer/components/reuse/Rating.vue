<template>
    <div class="star-rating">
        <p class="p-0 m-0 text-secondary your-rating fs-7">Your Rating</p>
        <span v-for="star in stars" :key="star" @click="rate(star)" class="star" :class="{ filled: star <= rating }">
            ★
        </span>
    </div>
</template>
  
<script setup>
import { ref, watchEffect } from 'vue';

const emit = defineEmits(['update:rating']);
const props = defineProps({
    initialRating: {
        type: Number,
        default: 0,
    },
});

const stars = ref([1, 2, 3, 4, 5]);
const rating = ref(props.initialRating); // Initialize rating with initialRating

// Ensure rating updates if initialRating changes, useful for dynamic updates
watchEffect(() => {
    rating.value = props.initialRating;
});

function rate(star) {
    rating.value = star;
    emit('update:rating', star);
}
</script>
  
<style>
.your-rating {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    text-align: center;
}
.star {
    cursor: pointer;
    color: grey;
}

.filled {
    color: gold;
}
</style>
  