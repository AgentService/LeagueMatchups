<template>
    <div :class="`component-instance-${props.instanceId} d-flex h-100`">
        <div class="container">
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item" role="presentation" v-for="tab in tabs" :key="tab">
                    <button class="nav-link" :class="{ active: activeTab === tab }" @click="selectTab(tab)"
                        :id="`tab-${tab.toLowerCase()}-${props.instanceId}`" data-bs-toggle="tab"
                        :data-bs-target="`#pane-${tab.toLowerCase()}-${props.instanceId}`" type="button" role="tab"
                        :aria-controls="`pane-${tab.toLowerCase()}-${props.instanceId}`" :aria-selected="activeTab === tab">
                        {{ tab }}
                    </button>
                </li>
            </ul>
            <div class="tab-content-container h-100">
                <div class="tab-content" id="championTabContent">
                    <!-- Abilities Tab Pane -->
                    <div :id="`abilities-tab-pane-${props.instanceId}`" class="tab-pane fade"
                        :class="{ show: activeTab === 'Abilities', active: activeTab === 'Abilities' }" role="tabpanel"
                        aria-labelledby="`tab-abilities-${props.instanceId}`">
                        <div class="champion-abilities-card">
                            <!-- Passive with tooltip -->
                            <div class="ability" v-if="champion?.passive">
                                <div class="ability-icon-wrapper">
                                    <img :src="getPassiveImageUrl(champion?.passive)" :alt="champion?.passive.name"
                                        class="ability-icon" />
                                    <span class="ability-label">P</span>
                                </div>
                                <div class="tooltip">
                                    <div class="tooltip-content">
                                        <div class="tooltip-header">
                                            <img :src="getPassiveImageUrl(champion?.passive)" :alt="champion?.passive.name"
                                                class="tooltip-spell-icon" />
                                            <span class="ability-label">P</span>
                                        </div>
                                        <h5 class="spell-name">{{ champion?.passive.name }}</h5>
                                        <p class="spell-description">{{ champion?.passive.description }}</p>
                                    </div>
                                </div>
                            </div>
                            <!-- Skills with tooltip -->
                            <div class="abilities-container">
                                <!-- Abilities -->
                                <div v-for="(spell, index) in champion?.spells" :key="spell.id" class="ability">
                                    <div class="ability-icon-wrapper">
                                        <img :src="getSpellImageUrl(spell)" :alt="spell.name" class="ability-icon" />
                                        <span class="ability-label">{{ getAbilityLabelByIndex(index) }}</span>
                                    </div>
                                    <div class="tooltip">
                                        <div class="tooltip-content">
                                            <div class="tooltip-header">
                                                <img :src="getSpellImageUrl(spell)" :alt="spell.name"
                                                    class="tooltip-spell-icon" />
                                                <span class="ability-label">{{ getAbilityLabelByIndex(index) }}</span>
                                            </div>
                                            <h5 class="spell-name">{{ spell.name }}</h5>
                                            <div>
                                                <p class="spell-cooldown">Cooldown: <span class="value-text">{{
                                                    spell.cooldownBurn
                                                }}</span></p>
                                                <p class="spell-cost">Cost: <span class="value-text">{{ spell.costBurn
                                                }}</span>
                                                </p>
                                            </div>
                                            <p class="spell-description">{{ spell.description }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Tab Pane -->
                    <div :id="`stats-tab-pane-${props.instanceId}`" class="tab-pane fade"
                        :class="{ show: activeTab === 'Stats', active: activeTab === 'Stats' }" role="tabpanel"
                        aria-labelledby="`tab-stats-${props.instanceId}`">
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
                        </div>
                    </div>

                    <!-- Tips Tab Pane -->
                    <!-- <div :id="`tips-tab-pane-${props.instanceId}`" class="tab-pane fade"
                        :class="{ show: activeTab === 'Tips', active: activeTab === 'Tips' }" role="tabpanel"
                        aria-labelledby="`tab-tips-${props.instanceId}`">
                        <div class="champion-enemy-tips">
                            <div class="enemy-tips">
                                <h3>Enemy Tips</h3>
                                <ul>
                                    <li v-for="tip in enemyTips" :key="tip">{{ tip }}</li>
                                </ul>
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>
        </div>
    </div>

    <!-- <div class="champion-portrait">
        <img :src="getChampionImageUrl(champion?.image?.full)" alt="Champion Name" />
    </div> -->
</template>
  
<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { debug } from 'debug';

// Define props
const props = defineProps({
    champion: {
        type: Object,
        default: () => ({ /* default object structure */ })
    },
    instanceId: {
        type: Number,
        required: true
    }
});


const championIdx = 'Sylas';
const apiUrl = `http://localhost:3001/api/champions/${championIdx}`;
const store = useStore();
const championId = ref(props.champion?.id);

const championTips = computed(() => {
  // Zugriff auf den Getter im "matchups"-Modul
  return store.getters['champions/getChampionTips'](championId.value);
});

debug('championTips', championTips.value);
axios.get(apiUrl)
    .then((response) => {
        console.log('Champion Info:', response.data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
const selectTab = (tab) => {
    activeTab.value = tab; // This now simply updates the local reactive state
};

watch(() => props.instanceId, (newVal, oldVal) => {
    // Logic here if you need to do something when instanceId changes
});
const tabs = ['Stats'];
const activeTab = ref('Abilities'); // Default active tab, could be 'Stats' or 'Tips' based on your logic

const enemyTips = computed(() => {
    console.log(props.champion);
    return props.champion?.enemytips || [];
});
const abilityLabels = ['Q', 'W', 'E', 'R'];

const getAbilityLabelByIndex = (index) => {
    return abilityLabels[index] || ''; // Fallback to empty string if index is out of range
};
// Fixed selected stats keys
const selectedStatKeys = ['hp', 'armor', 'spellblock', 'attackdamage', 'movespeed'];

const getSpellImageUrl = (spell) => {
    // Construct the URL for the spell image
    return `./img/dragontail/13.21.1/img/spell/${spell.image.full}`;
};

const getPassiveImageUrl = (passive) => {
    // Construct the URL for the passive image
    const path = `./img/dragontail/13.21.1/img/passive/${passive?.image.full}`;
    return path;
};
const getStatImageUrl = (statKey) => {
    const statIcons = {
        AdaptiveForce: 'StatModsAdaptiveForceIcon.png',
        armor: 'StatModsArmorIcon.png',
        attackdamage: 'StatModsAttackDamageIcon.png',
        // CDR: 'StatModsCDRScalingIcon.png',
        hp: 'StatModsHealthScalingIcon.png',
        spellblock: 'StatModsMagicResIcon.png',
        // abilitypower: 'StatModsAbilityPowerIcon.png',
        movespeed: 'StatModsMovementSpeedIcon.png',
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
.container {
    display: flex;
    /* Flex container */
    flex-direction: column;
    /* Children in a column */
    min-height: 100%;
    /* Take full height of its parent */
    width: 100%;
    /* Take full width */
    margin: 0;
    /* Reset any margins that might be applied */
}

.tab-content-container {
    flex: 1;
    /* Takes up all available space within .container */
    display: flex;
    /* Flex container */
    width: 100%;
    /* Take full width */
    flex-direction: column;
    /* Stacks children vertically */
    /* You may not need min-height here if parent's height is well-defined */
}

/* Instance 1 specific styles */


.nav-tabs .nav-link.active,
.nav-tabs .nav-item.show .nav-link {
    color: var(--gold-3);
    background: var(--grey-cool);
    border: 1px solid #1b2735;
}

.nav-link {
    color: var(--gold-2);
}

.nav-tabs .nav-link:hover {
    color: var(--gold-3);
    border: 1px solid var(--grey-3);
}

ul.nav {
    border-bottom: 3px solid #1b2735;
}

/* Tab Content Customization */
.tab-content {
    flex: 1;
    /* Takes up all available space within .tab-content-container */
    padding: 10px;
    min-height: 100%;
    /* No need to set width here if it's already flex item of a flex container */
}

.tab-pane {
    flex: 1;
    color: var(--gold-3);
    /* border: solid 1px #28a745; */
    width: 100%;
    min-height: 100%;
}

/* Custom classes for your specific elements based on the mockup */
/* Add these classes to the respective elements in your HTML */
.neon-green {
    color: #76ff03;
    /* Neon green text color */
}

.neon-blue {
    color: #29b6f6;
    /* Neon blue text color */
}

.neon-pink {
    color: #ff0266;
    /* Neon pink text color */
}

/* You might also want to add a glow effect for neon aesthetics */
.neon-glow {
    text-shadow: 0 0 5px var(--blue-laser-1), 0 0 10px var(--blue-laser-2), 0 0 20px var(--blue-laser-1);
    /* blue glow */
}

.enemy-tips {
    /* Styling des Enemy Tips Bereichs */
}

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
    justify-content: center;
    /* Align to the left */
}

.passive-container,
.abilities-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.ability {
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

.ability-icon-wrapper {
    position: relative;
    display: inline-block;
    /* Or flex, depending on your layout */
}

.passive-icon,
.ability-icon {
    display: block;
    width: 45px;
    height: 45px;
}

.ability-label {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #000;
    color: #fff;
    padding: 2px 5px;
    font-size: 0.75rem;
    border-radius: 2px 0 0 0;
    /* Rounded top-left corner */
}

.tooltip .ability-label {
    left: 2.7rem;
}


/* Assign colors to specific classes */
.label-q {
    color: #ff4757;
}

.label-w {
    color: #1e90ff;
}

.label-e {
    color: #7bed9f;
}

.label-r {
    color: #f1c40f;
}

.tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-50%, 0);
    visibility: hidden;
    opacity: 0;
    background-color: black;
    color: var(--grey-1);
    padding: 1rem 2rem;
    border-radius: 0.25rem;
    z-index: 100;
    min-width: 300px;
    transition: visibility 0.2s, opacity 0.2s ease-in-out;
    /* Other styles */
}

.tooltip div {
    margin-bottom: 0.5rem;
}

.tooltip div:last-child {
    margin-bottom: 0;
}

.tooltip-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.tooltip-header {
    position: relative;
    width: 100%;
}

.tooltip-spell-icon {
    float: left;
    width: 66px;
    height: 66px;
    margin-right: 10px;
}

.spell-name {
    color: var(--gold-1);
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 5px;
}

.spell-cooldown,
.spell-cost {
    font-size: 0.875rem;
    margin-bottom: 2px;
}

.spell-description {
    font-size: 0.875rem;
    margin-top: 10px;
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


.value-text {
    color: var(--blue-laser-1);
    /* Replace with your preferred shade of blue if needed */
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