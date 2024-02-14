<template>
    <div class="d-flex flex-column align-items-center justify-content-center pe-3 star-rating-container">
        <div class="average-rating-number">{{ averageRating.toFixed(1) }}</div>

        <div class="star-rating d-flex flex-row">
            <!-- Display stars based on the average rating -->

            <div v-for="star in computedStars" :key="star.index" class="star"
                :class="{ 'filled': star.type === 'full', 'half-filled': star.type === 'half', 'empty': star.type === 'empty' }">
                ★
            </div>
            <!-- Display the numerical average rating -->
        </div>
    </div>
</template>

  

<script setup>
import { computed } from 'vue';
import Debug from 'debug';

const debug = Debug('app:component:ChampionNotes');

const props = defineProps({
    averageRating: {
        type: Number,
        default: 0,
    },
});

const computedStars = computed(() => {
    let starsArray = [];
    const fullStars = Math.floor(props.averageRating);
    const halfStar = props.averageRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsArray.push({ index: i, type: 'full' });
        } else if (halfStar && i === fullStars + 1) {
            starsArray.push({ index: i, type: 'half' });
        } else {
            starsArray.push({ index: i, type: 'empty' });
        }
    }
    return starsArray;
});

</script>

<style>
.star-rating-container {
    font-size: 1rem;
    font-weight: bold;
    color: var(--gold-4);
    border-right: 1px solid var(--grey-4);
}

.star {
    color: grey;
    /* Color for empty stars */
}

.filled {
    color: gold;
    /* Color for filled stars */
}

.half-filled {
    color: gold;
    background: linear-gradient(90deg, gold 50%, grey 50%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.average-rating-number {
    font-weight: bold;
    color: var(--gold-4);
}
</style>
