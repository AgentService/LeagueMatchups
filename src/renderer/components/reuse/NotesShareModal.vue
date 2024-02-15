<template>
	<div class="modal d-flex" id="championNotesModal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true"
		v-if="isVisible">
		<div class="modal-dialog modal-xl modal-dialog-centered">
			<div class="modal-content modal-container">
				<div class="p-3">
					<div class="background-image-container" :style="championBackgroundStyle"></div>

					<div class="modal-header flex-row position-relative">
						<div class="modal-title d-flex justify-content-between align-items-start w-100 flex-column">
							<span class="" id="modalLabel">{{ modalTitle }}</span>
							<p v-if="champion">Champion Notes for {{ champion.name }}</p>
							<p v-else-if="championA && championB">Matchup Notes for {{ championA.name }} vs {{
								championB.name }}</p>

						</div>
						<button @click="$emit('update:isVisible', false)" type="button" class="btn-close btn-close-white"
							data-bs-dismiss="modal" aria-label="Close"></button>
					</div>

					<div class="modal-body ">

						<!-- <div class="d-flex justify-content-center align-items-center">
						<div v-for="(note, index) in notes.slice(0, 3)" :key="note.id" class="card m-2">
							<div class="card-header d-flex justify-content-between align-items-center">
								<div class="champion-images">
									<img v-if="champion" :src="getChampionImageSource('small', champion.name)"
										alt="Champion image" class="card-champion-image me-2">
									<div v-if="championA && championB" class="d-flex align-items-center">
										<img :src="getChampionImageSource('small', championA.name)" alt="Champion A image"
											class="card-champion-image me-1">
										<span>vs</span>
										<img :src="getChampionImageSource('small', championB.name)" alt="Champion B image"
											class="card-champion-image ms-1">
									</div>
								</div>
								<span class="badge"
									:class="{ 'bg-primary': notesType === 'champion', 'bg-warning text-dark': notesType === 'matchup', 'bg-danger': notesType === 'general' }">{{
										notesType }} Notes</span>
							</div>
							<div class="card-body">
								<p class="card-text text-light">{{ note.content }}</p>
							</div>
							<div class="card-footer text-muted">
								<div class="user">
									<div class="user__info">
										<p>{{ note.username }}</p>
										<small>{{ formatDate(note.updated_at) }}</small>
									</div>
								</div>
							</div>
						</div>
					</div> -->

						<div class="d-flex justify-content-between">
							<div class="list-group align-items-center p-4">
								<div class="modal-header-2 d-flex justify-content-between">
									<div v-if="champion">
										<img v-if="champion" :src="getChampionImageSource('small', champion.name)"
											alt="Champion image" class="modal-champion-image">
									</div>
									<div v-else-if="championA && championB" class="">
										<img :src="getChampionImageSource('small', championA.name)" alt="Champion A image"
											class="modal-champion-image me-2">
										<span>vs</span>
										<img :src="getChampionImageSource('small', championB.name)" alt="Champion B image"
											class="modal-champion-image ms-2">
									</div>
									<FilterBar @update:filter="handleFilterUpdate"></FilterBar>
								</div>
								<div class="d-flex flex-column w-100 overflow-auto">
									<a href="#" v-for="(note, index) in filteredNotes" :key="note.noteId"
										class="list-group-item list-group-item-action d-flex"
										@click.prevent="selectNote(index)">

										<RatingAverage :averageRating="parseFloat(note.averageRating)" />

										<!-- <img :src="getChampionImageSource('small', champion.name)" alt="Champion image"
										class="card-champion-image" /> -->
										<img :src="getSummonerIcon('5555', index)" alt="Champion image"
											class="card-champion-image ms-3" />
										<div class="user ps-2">
											<!-- Placeholder for user image; you can replace this with actual user data if available -->
											<!-- <img src="https://i.pravatar.cc/40?u={{ note.username }}" alt="user__image" class="user__image"> -->
											<div class="user__info">
												<p><span>Notes by </span>{{ note.username }}</p>
												<small>{{ formatDate(note.updatedAt) }}</small>
											</div>
										</div>
									</a>
									<div v-if="selectedNoteIndex !== null && filteredNotes.length <= 0"
										class=" d-flex justify-content-center align-items-center h-100">
										<p>No notes available.</p>
									</div>
								</div>
							</div>

							<div v-if="selectedNoteIndex !== null && filteredNotes.length > 0"
								class=" d-flex justify-content-center align-items-center">
								<div class="modal-card d-flex mt-0">
									<div class="card-header d-flex justify-content-between align-items-center">
										<!-- Champion images and notes type tags -->
										<div class="champion-images-container">
											<img v-if="champion" :src="getChampionImageSource('small', champion.name)"
												alt="Champion image" class="card-champion-image">
											<div v-else-if="championA && championB" class="d-flex align-items-center">
												<img :src="getChampionImageSource('small', championA.name)"
													alt="Champion A image" class="card-champion-image me-2">
												<span>vs</span>
												<img :src="getChampionImageSource('small', championB.name)"
													alt="Champion B image" class="card-champion-image ms-2">
											</div>
										</div>
										<span class="badge"
											:class="{ 'bg-primary': notesType === 'champion', 'bg-warning text-dark': notesType === 'matchup', 'bg-danger': notesType === 'general' }">{{
												notesType }} Notes</span>
									</div>
									<div class="card-body ">
										<p class="card-text text-light">{{ filteredNotes[selectedNoteIndex]?.content }}</p>
									</div>
									<div class="card-footer justify-content-between pb-0">
										<div class="user">
											<!-- Placeholder for user image; you can replace this with actual user data if available -->
											<!-- <img src="https://i.pravatar.cc/40?u={{ note.username }}" alt="user__image" class="user__image"> -->
											<div class="user__info">
												<p>{{ filteredNotes[selectedNoteIndex]?.username }}</p>
												<small>{{ formatDate(filteredNotes[selectedNoteIndex]?.updatedAt) }}</small>
											</div>
										</div>
										<Rating :initialRating="filteredNotes[selectedNoteIndex]?.personalRating"
											@update:rating="updateRating(notesType, filteredNotes[selectedNoteIndex]?.noteId, $event)" />
									</div>
								</div>
							</div>

						</div>
					</div>

				</div>
				<!-- <div class="modal-footer">
					<button @click="$emit('update:isVisible', false)" class="btn btn-danger">Close</button>
				</div> -->
			</div>

		</div>

	</div>
</template>
  
  

<script setup>
import { computed, defineProps, ref, toRefs } from 'vue';
import { getUrlHelper } from '../../globalSetup';
import { watchEffect } from 'vue';
import { useStore } from 'vuex';
import Rating from './Rating.vue';
import RatingAverage from './RatingAverage.vue';
import FilterBar from './FilterBarNotes.vue';
import debug from 'debug';

const store = useStore();

const props = defineProps({
	isVisible: Boolean,
	notesType: String,
	champion: Object,
	championA: Object,
	championB: Object,
});

const filteredNotes = ref([]);
const searchQuery = ref('');
const showFavorites = ref(false);
const sortDescending = ref(true); // Start with true for descending order
const selectedNoteIndex = ref(0);

const isVisible	= computed(() => props.isVisible);
const sharedNotes = ref([]);
const champion = computed(() => props.champion);
const championA = computed(() => props.championA);
const championB = computed(() => props.championB);
const notesType = computed(() => props.notesType);

console.log(champion.value, championA.value, championB.value);

const handleFilterUpdate = ({ type, value }) => {
	// Update your filters based on the filter bar events
	if (type === 'search') {
		searchQuery.value = value;
	} else if (type === 'favorites') {
		showFavorites.value = value;
	} else if (type === 'rating') {
		sortDescending.value = !sortDescending.value; // Toggle between true and false
	}
};

// Inside your SharedNotesModal component
function fetchData(championNameOrMatchupId) {
	if (notesType.value === 'champion') {
		sharedNotes.value = store.getters['notes/getChampionNotesShared'](championNameOrMatchupId);
	} else if (notesType.value === 'matchup') {
		// Assuming championA and championB are available and properly reactive
		sharedNotes.value = store.getters['notes/getMatchupNotesShared'](championNameOrMatchupId);
	} else if (notesType.value === 'general') {
		sharedNotes.value = store.getters['notes/getGeneralNotesShared']();
	}
}
defineExpose({ fetchData });

watchEffect(() => {
	// Start with a shallow copy of notes to avoid direct mutation
	let result = sharedNotes.value?.slice() || [];

	// Apply filters only if there are changes to searchQuery, showFavorites, or sortByRating
	if (searchQuery.value) {
		result = result.filter(note => note.title.includes(searchQuery.value) || note.content.includes(searchQuery.value));
	}
	if (showFavorites.value) {
		result = result.filter(note => note.isFavorite);
	}
	if (sortDescending.value) {
		result.sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating));
	} else {
		result.sort((a, b) => parseFloat(a.averageRating) - parseFloat(b.averageRating));
	}
	filteredNotes.value = result;
}, { flush: 'post' });

const getSummonerIcon = (iconId, index) => {
	const urlHelper = getUrlHelper();
	const intValue = parseInt(iconId, 10); // Convert string to integer
	const string = intValue + index;
	return urlHelper.getSummonerIconUrl(string);
};

const selectNote = (index) => {
	selectedNoteIndex.value = index;
};

const getChampionImageSource = (type, championName) => {
	const urlHelper = getUrlHelper();
	return urlHelper.getChampionImageSource(type, championName);
};

const championBackgroundStyle = computed(() => {
	if (champion || championB) {
		const championName = champion ? champion.name : championB.name;
		const urlHelper = getUrlHelper();
		const imageUrl = urlHelper.getChampionImageSource('splash', championName);

		return {
			backgroundImage: `url('${imageUrl}')`,
			opacity: 0.05
		};
	}
	return {};
});

const modalTitle = computed(() => {
	if (notesType.value === 'champion') {
		return 'Community Notes';
	} else if (notesType.value === 'matchup') {
		// return `Community Notes ${championA ? `${championA.name} vs ${championB.name}` : ''}`;
		return 'Community Notes';
	}
});

const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric', month: 'long', day: 'numeric'
	});
};

// This method now accepts a 'notesType' parameter to differentiate between champion and matchup notes.
const updateRating = (notesType, noteId, rating) => {
	const identifier = notesType === 'champion' ? champion.name : store.getters['matchups/getCurrentMatchup'].combinedId;
	if (notesType === 'champion') {
		store.dispatch('notes/updateChampionNoteRating', { championName: identifier, noteId, rating });
	} else if (notesType === 'matchup') {
		store.dispatch('notes/updateMatchupNoteRating', { matchupId: identifier, noteId, rating });
	}
};

</script>



<style scoped>
.modal-container {
	background: var(--card-background);
	border: 1px solid rgba(128, 128, 128, 0.1);
	min-width: 1100px;
	max-width: 1100px;
	min-height: 700px;
	max-height: 700px;
}

.modal-body {
	background-color: #05080f;
	margin: 1rem;
}

.modal-card {
	position: relative;
	display: flex;
	flex-direction: column;
	padding: 1rem;
	width: 500px;
	height: 500px;
	z-index: auto;
	background-color: #05080f;
}

.modal {
	background-color: rgba(0, 0, 0, 0.69);
}

.modal-dialog {
	min-width: 80vh;
}

.list-group {
	color: white;
	border: none;
	width: 600px;
	height: 450px;
	z-index: 1;
	padding: 1rem;
	background-color: #05080f;

}

.list-group-item {
	border: none;
	border-radius: 0;
	background-color: #0a1320;
	margin-bottom: .5rem;
}

.list-group-item-action:hover {
	background-color: var(--grey-4);
}

.list-group-item-action:focus,
.list-group-item-action:active {
	background-color: var(--grey-4);
	color: #495057;
	outline: none;
}



.background-image-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
	background-size: cover;
	background-position: left top;
	background-repeat: no-repeat;
	filter: grayscale(90%);
}

.modal-header {
	text-transform: uppercase;
	font-weight: 700;
	text-align: start;
	font-size: 1.5rem;
	border: 0;

}

.modal-title p {
	font-size: 1rem;
	color: var(--gold-2);
	margin-bottom: 0;
}

.modal-header-2 {
	text-align: center;
	font-weight: 500;
	font-size: 1rem;
	margin-bottom: 1rem;
	background-color: #0a1320;
	width: 100%;
	padding: .5rem;
}

.modal-content {
	color: white;
	text-transform: none;
	border: 1px solid var(--grey-4);
}

.champion-images-container {
	font-weight: 500;
	text-transform: none;
	font-size: 1rem;
}

.card-champion-image {
	width: 55px;
	margin: .5rem .5rem;
	border: 1px solid var(--gold-2);
}

.modal-champion-image {
	width: 60px;
	border: 1px solid var(--gold-2);
}

.card-body {
	padding: 1rem;
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100%;
}

.card-body p {
	font-size: 1rem;
	white-space: pre-wrap;
	font-weight: 500;
	margin-bottom: 0;
}

.card-footer {
	display: flex;
	margin-top: auto;
	align-items: center;
	border-top: 1px solid var(--gold-7);
}

.user {
	display: flex;
	align-items: center;
}

.user__info p {
	font-size: 1rem;
	margin: 0;
	color: var(--gold-2);
	line-height: 0.5rem;
}

.user__info span {
	font-size: 1rem;
	color: var(--gold-1);
}

.user__info>small {
	color: #666;
	font-size: .8rem;
}
</style>