<template>
	<div v-if="isVisible" class="modal-overlay">
		<div class="modal-content">
			<h2>{{ modalTitle }}</h2>
			<div v-for="note in notes" :key="note.id" class="note"> <!-- Use passed notes here -->
				<p>{{ note.username }}: {{ note.content }}</p>
				<small>Updated: {{ formatDate(note.updated_at) }}</small>
			</div>
			<button @click="$emit('update:isVisible', false)">Close</button>
		</div>
	</div>
</template>

<script setup>
import { computed, defineProps } from 'vue';

const { isVisible, notes, notesType } = defineProps({
	isVisible: Boolean,
	notes: Array,
	notesType: String,
});

const modalTitle = computed(() => notesType === 'champion' ? 'Champion Notes' : 'Matchup Notes');

const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric', month: 'long', day: 'numeric'
	});
};
</script>

  

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	/* Slightly darker overlay */
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
	/* High z-index to ensure overlay is above other content */
}

.modal-content {
	width: 30%;
	min-width: 300px;
	/* Minimum width for responsiveness */
	background-color: #fff;
	/* Change to match your modal's background */
	padding: 25px;
	border: 1px solid #ccc;
	/* Adjust according to your theme */
	border-radius: 8px;
	/* Rounded corners for the modal */
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
	/* Soft shadow for depth */
	transition: transform 0.3s ease-out;
	/* Smooth scaling transition */
	transform: scale(1.05);
	/* Slightly scale up for attention */
}

.note {
	background-color: #f7f7f7;
	/* Light grey background for each note */
	padding: 15px;
	border-radius: 4px;
	/* Rounded corners for notes */
	margin-bottom: 15px;
	/* Space between notes */
	color: #333;
	/* Text color for notes */
}

.note small {
	display: block;
	/* Ensure date is on its own line */
	color: #666;
	/* Lighter text color for date */
	font-size: 0.875rem;
	/* Smaller font size for date */
}

button {
	/* Style your button accordingly */
	background-color: #007bff;
	/* Example blue background */
	color: #fff;
	/* White text */
	padding: 10px 20px;
	border: none;
	border-radius: 5px;
	/* Slightly rounded corners for the button */
	cursor: pointer;
}

/* Additional styles for modal title and content */
h2 {
	color: #333;
	/* Title color */
	margin-bottom: 20px;
	/* Space below the title */
}

/* Adjust this to match your modal content's needs */
.modal-content p {
	white-space: pre-wrap;
	/* Preserve formatting of the note content */
}
</style>