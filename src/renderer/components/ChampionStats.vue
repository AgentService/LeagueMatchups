<template>
    <div class="champion-stat-card">
        <div class="stats-container">
            <!-- Iterate through your selected stats -->
            <div class="stat-item" v-for="statKey in selectedStatKeys" :key="statKey">
                <img :src="getStatImageUrl(statKey)" :alt="statKey" class="stat-icon" />
                <div class="stat-value">{{ champion?.stats[statKey] }}</div>
                <!-- If you have a name for the stat, uncomment the next line -->
                <!-- <div class="stat-name">{{ formatStatName(statKey) }}</div> -->
            </div>
        </div>
        <!-- <div class="champion-portrait">
            <img :src="getChampionImageUrl(champion?.image?.full)" alt="Champion Name" />
        </div> -->
        <div class="champion-abilities-card">
        <!-- Passive with tooltip -->
        <div class="passive-container">
            <img :src="getPassiveImageUrl(champion?.passive)" :alt="champion?.passive.name" class="passive-icon" />
            <div class="tooltip">{{ champion?.passive?.description }}</div>
        </div>

        <!-- Skills with tooltip -->
        <div class="abilities-container">
            <!-- Abilities -->
            <div class="ability" v-for="spell in champion?.spells" :key="spell.id">
                <img :src="getSpellImageUrl(spell)" :alt="spell.name" class="ability-icon" />
                <div class="tooltip">{{ spell.description }}</div>
                <span class="ability-label">{{ spell.id.slice(-1) }}</span>
            </div>
        </div>
    </div>
    </div>


</template>
  
<script setup>
import { computed } from 'vue';

// Define props
const props = defineProps({
    champion: {
        type: Object,
        required: true,
    },
});

// Fixed selected stats keys
const selectedStatKeys = ['hp', 'armor', 'spellblock', 'attackdamage'];

// Composables and methods
const formatStatName = (statKey) => {
    // Convert snake_case to Normal Case for display
    return statKey.replace(/_/g, ' ').replace(/(\b[a-z](?!\s))/g, char => char.toUpperCase());
};

const getChampionImageUrl = (championImage) => {
    // Construct the URL for the spell image
    const path = `./img/champions/${championImage}`;
    console.log(path);
    return path;
};

const getSpellImageUrl = (spell) => {
    // Construct the URL for the spell image
    return `./img/dragontail/13.21.1/img/spell/${spell.image.full}`;
};

const getPassiveImageUrl = (passive) => {
    // Construct the URL for the passive image
    const path = `./img/dragontail/13.21.1/img/passive/${passive?.image.full}`;
    console.log(path);
    return path;
};
const getStatImageUrl = (statKey) => {
    const statIcons = {
        // AdaptiveForce: 'StatModsAdaptiveForceIcon.png',
        armor: 'StatModsArmorIcon.png',
        attackdamage: 'StatModsAttackSpeedIcon.png',
        // CDR: 'StatModsCDRScalingIcon.png',
        hp: 'StatModsHealthScalingIcon.png',
        spellblock: 'StatModsMagicResIcon.png'
    };
    return `./img/dragontail/img/perk-images/StatMods/${statIcons[statKey]}`;
};


// If needed, use computed properties for reactive updates
// Example:
// const computedProperty = computed(() => {
//   // reactive computations
// });

</script>


<style scoped>
.champion-stat-card {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    /* Aligns children to the right */
    /* ... other styles ... */
}

.champion-abilities-card {
    display: flex;
    position: relative;
    /* The new positioning context for the tooltip */
    align-items: center;
    justify-content:center;
    /* Align to the left */
}

.passive-container,
.abilities-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
    /* Dark background for abilities */
    border-radius: 5px;
    /* Rounded corners */
}

.ability {
    margin-right: 5px;
    /* Space between ability icons */
}

.ability:last-child {
    margin-right: 0;
    /* No margin to the right of the last ability */
}

.stats-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* Aligns stats text to the left */
}

.stat-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    /* Space between stat items */
}

.stat-name {
    /* Optional: Add styles for the stat name if you have this element */
}

.stat-icon {
    width: 24px;
    /* Smaller icon width */
    height: 24px;
    /* Smaller icon height */
    margin-left: 8px;
    /* Space between text and icon */
}

.stat-value {
    font-size: 16px;
    /* Font size for the stat value */
    color: #fff;
    /* White text color */
}

.champion-portrait {
    width: 80px;
    /* Size of the circle */
    height: 80px;
    border-radius: 50%;
    /* Makes it circular */
    overflow: hidden;
    /* Hides anything that goes outside the circle */
    border: 3px solid gold;
    /* Gold border around the portrait */
    margin-left: 15px;
    /* Space between stats and portrait */
    /* ... other styles ... */
}

.champion-portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Ensures the image covers the area without stretching */
}

.passive-container,
.ability {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.passive-icon,
.ability-icon {
    width: 45px;
    height: 45px;
    margin-right: 5px;
}

.ability-label {
    position: absolute;
    bottom: -10px;
    /* Adjust as needed */
    font-size: 12px;
    color: #fff;
}

.tooltip {
    position: absolute;
    top: -100%;
    /* Position it above the icon */
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    background-color: var(--tooltip-bg-color, black);
    /* Use CSS variables for colors */
    color: var(--tooltip-text-color, white);
    padding: 0.5rem;
    /* Use rem for scalability */
    border-radius: var(--tooltip-border-radius, 0.25rem);
    z-index: 100;
    /* Adjust as needed */
    min-width: 300px;
    /* Adjust as necessary */
    overflow: hidden;
    /* Hide overflow */
    transition: visibility 0.2s, opacity 0.2s ease-in-out;
}

.tooltip::before {
    content: '';
    position: absolute;
    bottom: -5px;
    /* Adjust this value */
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent var(--tooltip-bg-color, black) transparent;
}


.passive-container:hover .tooltip,
.ability:hover .tooltip,
.stat-item:hover .tooltip {
    visibility: visible;
    opacity: 1;
}

/* Arrow for the tooltip */
.tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
    transform: translateX(-50%);
}

/* Handle spacing and layout */
.passive-container,
.ability,
.stat-item {
    margin-right: 10px;
}

.passive-container:last-child,
.ability:last-child,
.stat-item:last-child {
    margin-right: 0;
}

/* Responsive design adjustments */
@media (max-width: 768px) {

    .champion-abilities-card,
    .stats-container {
        flex-direction: column;
        align-items: flex-start;
    }

    .passive-container,
    .ability,
    .stat-item {
        margin-right: 0;
        margin-bottom: 10px;
    }
}
</style>