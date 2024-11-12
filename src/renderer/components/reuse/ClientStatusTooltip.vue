
<template>
    <div :class="['tooltip', clientConnected ? 'connected' : 'disconnected']" :style="tooltipStyle">
        <i :class="iconClass" class="me-1"></i>
        <span>{{ displayMessage }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

// Props to control visibility, connection status, and custom messages
const props = defineProps({
    clientConnected: {
        type: Boolean,
        required: true
    },
    visible: {
        type: Boolean,
        default: false
    },
    connectedMessage: {
        type: String,
        default: 'Client connected' // Default message for connected state
    },
    disconnectedMessage: {
        type: String,
        default: 'Client not connected' // Default message for disconnected state
    }
});

// Computed property to dynamically show the correct message
const displayMessage = computed(() => {
    return props.clientConnected ? props.connectedMessage : props.disconnectedMessage;
});

// Tooltip inline style to control visibility
const tooltipStyle = computed(() => ({
    opacity: props.visible ? 1 : 0,
    visibility: props.visible ? 'visible' : 'hidden'
}));

// Computed property for dynamic icon class
const iconClass = computed(() => {
    return props.clientConnected ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info';
});
</script>

<style scoped>
.tooltip {
    position: absolute;
    top: calc(100% + 5px);
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    z-index: 1090;
    text-align: center;
    align-self: center;
    justify-content: center;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.tooltip.connected {
    background-color: #28a745;
}

.tooltip.disconnected {
    background-color: #dc3545;
}
</style>
