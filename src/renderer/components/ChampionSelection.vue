<template>
	<!-- <div class="card-header-custom d-flex justify-content-between align-items-center">
		<span v-show="instanceId === 1">Champion Notes</span>
		<span v-show="instanceId === 2">Matchup Notes</span>
	</div> -->

	<div class="note-card champion-card ">
		<div class="background-image" :style="championBackgroundStyle"></div>
		<!-- <div class="widget-header">
			<i class="fas fa-sticky-note note-icon"></i>
			<span class="widget-header-title ms-1" v-if="instanceId === 1">Select your Champion</span>
			<span class="widget-header-title ms-1" v-if="instanceId === 2">Select your Opponent</span>
		</div> -->
		<div class="d-flex justify-content-between align-items-center">
			<div class="search-container">

				<div class="search-bar position-relative">
					<div class="input-group">
						<span class="input-group-text" @click="showGrid">
							<i class="fa-solid fa-search fa-xs"></i>
						</span>
						<input type="text" @click.stop="showGrid" v-model="searchTerm" @input="filterChampions"
							placeholder="Your Champion" class="form-control" v-if="instanceId === 1" />

						<input type="text" @click.stop="showGrid" v-model="searchTerm" @input="filterChampions"
							placeholder="Enemy Champion" class="form-control" v-if="instanceId === 2" />
					</div>
				</div>
			</div>

			<div class="button-container">
				<div class="fav-button" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
					v-if="instanceId === 1">
					<button>
						<i class="fa-solid fa-star fa-sm"></i> 
					</button>
					<div class="fav-popup" v-if="showFavorites" @mouseenter="handlePopupMouseEnter"
						@mouseleave="handlePopupMouseLeave">
						<div v-for="champion in favoriteChampions" :key="champion.id" class="fav-item"
							@click="selectChampion(champion)">
							<img :src="championImageUrls[champion.id]" alt="Champion Image" />
						</div>
					</div>
				</div>
				<button key="championA-community-notes-button" class="button shared-button"
					@click="showNotesModal = true" aria-label="Community Notes for {{ championA.name }}"
					:title="'Community Notes for ' + championA?.name" v-if="instanceId === 1">
					<i class="fa fa-sm fa-users" aria-hidden="true"></i>
				</button>
				<button key="championB-community-notes-button" class="button shared-button"
					@click="showMatchupNotesModal = true" aria-label="Community Notes for {{ championB.name }}"
					:title="'Community Notes for ' + championB?.name" v-if="instanceId === 2">
					<i class="fa fa-sm fa-users" aria-hidden="true"></i>
				</button>
				<SharedNotesModal ref="NotesSharedModalRef" :isVisible="showNotesModal" notesType="champion"
					title="Shared Champion Notes" :champion="championA" @update:isVisible="showNotesModal = $event" />

				<SharedNotesModal ref="MatchupNotesModalRef" :isVisible="showMatchupNotesModal" notesType="matchup"
					title="Shared Matchup Notes" :championA="championA" :championB="championB"
					@update:isVisible="showMatchupNotesModal = $event" />


			</div>

		</div>

		<!-- Champion Grid Container -->
		<transition name="fade" mode="in-out">
			<div class="champion-grid-container" :class="{ 'open': isGridVisible }">
				<div class="champion-grid" v-show="isGridVisible" v-click-outside="outsideClickHandler">
					<div v-for="champion in filteredChampions" :key="champion.id" class="champion-tile"
						@click="selectChampion(champion)">
						<img :src="championImageUrls[champion.id]" alt="Champion Image" />
						<!-- <span>{{ champion.name }}</span> -->
					</div>
				</div>

			</div>
		</transition>
		<transition name="fade">
			<div v-if="showRestrictionPopup" class="restriction-popup">
				<p>You cannot select the same champion for both sides.</p>
				<button @click="closeRestrictionPopup">OK</button>
			</div>
		</transition>
		<div v-if="loading" class="loading-indicator">
			Loading...
		</div>

		<div v-else class="champion-detail-container" v-if="selectedChampion" v-show="!isGridVisible">
			<transition name="fade" mode="out-in">
				<div class="champion-detail-wrapper champion-detail--instance1 " v-if="instanceId === 1">

					<div :class="[themeClass, 'champion-content']">
						<!-- Champion Image Container -->

						<div class="champion-portrait">
							<img class="champion-image" :src="championImageUrls[selectedChampion.id]"
								:class="{ 'champion-picked': championPicked }" alt="Champion Image"
								@click.stop="showGrid" :ref="getInstanceIdRef" />
						</div>

						<div class="champion-info">
							<div class="champion-name-container">
								<div class="champion-name">{{ selectedChampion.name }}</div>
								<!-- <div class="stats-container">
									<div @mouseover="isStatsVisible = true" @mouseleave="isStatsVisible = false">
										<img :src="getStatImageUrl('statToggle')" alt="Toggle Stats" class="stat-toggle-icon" />
									</div>
									<div class="stats-tooltip-container collapse" :class="{ show: !isStatsCollapsed }">
										<div v-show="isStatsVisible" class="stats-tooltip">
											<div class="stat-item d-flex align-items-center" v-for="statKey in selectedStatKeys"
												:key="statKey">
												<div class="stat-value">{{ selectedChampion.stats[statKey] }}</div>
												<img :src="getStatImageUrl(statKey)" :alt="statKey" class="stat-icon" />
											</div>
										</div>
									</div>
								</div> -->
								<div @click="toggleFavorite(selectedChampion)" class="favorite-icon"
									:class="{ 'is-favorite': isFavorite(selectedChampion) }">
									<i class="fa fa-star fa-xs"></i>
								</div>

							</div>
							<div class="abilities-container">
								<div class="champion-abilities">
									<div class="ability ability-icon-wrapper" v-if="selectedChampion?.passive">
										<div class="ability-content">
											<div class="ability-icon-wrapper">
												<img :src="selectedChampionPassiveUrl"
													:alt="selectedChampion?.passive.full"
													class="ability-icon-passive" />
											</div>
										</div>
										<div class="tooltip-container">
											<div class="tooltip">
												<div class="tooltip-content">
													<div class="tooltip-header">
														<img :src="getPassiveImageUrl(selectedChampion?.passive)"
															:alt="selectedChampion?.passive.name"
															class="tooltip-spell-icon" />
														<span class="ability-label">P</span>
													</div>
													<h5 class="spell-name">{{ selectedChampion?.passive.name }}</h5>
													<p class="spell-description">{{
														selectedChampion?.passive.description }}
													</p>
												</div>
											</div>
										</div>
									</div>
									<div v-for="(spellData, index) in selectedChampionSpell" :key="index"
										class="ability">
										<div class="ability-icon-wrapper">
											<img :src="spellData.url" class="ability-icon" />
											<div class="cooldown">{{
												spellData.spell.cooldownBurn.split('/')[0] }}s</div>
											<!-- <div class="cooldown">{{ spell.cooldownBurn.split('/')[0] }}</div> -->
											<div class="tooltip-container">
												<div class="tooltip">
													<div class="tooltip-content">
														<div class="tooltip-header">
															<img :src="spellData.url" :alt="spellData.spell.name"
																class="tooltip-spell-icon" />
															<span class="ability-label">{{
																getAbilityLabelByIndex(index)
															}}</span>
														</div>
														<h5 class="spell-name">{{ spellData.spell.name }}</h5>
														<div>
															<p class="spell-cooldown">Cooldown: <span
																	class="value-text">{{
																		spellData.spell.cooldownBurn
																	}}</span></p>
															<p class="spell-cost">Cost: <span class="value-text">{{
																spellData.spell.costBurn
															}}</span>
															</p>
														</div>
														<p class="spell-description">{{ spellData.spell.description
															}}
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</transition>


			<!-- Instance 2: Icon Left + Icons Right -->
			<div class="champion-detail-wrapper champion-detail--instance2 " v-if="instanceId === 2">
				<!-- Champion Image Container -->
				<div :class="[themeClass, 'champion-content']">
					<!-- Champion Image Container -->
					<div class="champion-portrait">
						<img class="champion-image" :src="championImageUrls[selectedChampion.id]" alt="Champion Image"
							@click.stop="showGrid" :ref="getInstanceIdRef" />
					</div>
					<div class="champion-info">
						<div class="champion-name-container">
							<div class="champion-name">{{ selectedChampion.name }}</div>
							<!-- <div class="stats-container">
									<div @mouseover="isStatsVisible = true" @mouseleave="isStatsVisible = false">
										<img :src="getStatImageUrl('adaptiveforcescaling')" alt="Toggle Stats"
											class="stat-toggle-icon" />
									</div>
									<div class="stats-tooltip-container collapse" :class="{ show: !isStatsCollapsed }">
										<div v-show="isStatsVisible" class="stats-tooltip">
											<div class="stat-item d-flex align-items-center"
												v-for="statKey in selectedStatKeys" :key="statKey">
												<div class="stat-value">{{ selectedChampion.stats[statKey] }}</div>
												<img :src="getStatImageUrl(statKey)" :alt="statKey" class="stat-icon" />
											</div>
										</div>
									</div>
								</div> -->
						</div>
						<div class="abilities-container">
							<div class="champion-abilities">
								<div class="ability ability-icon-wrapper" v-if="selectedChampion?.passive">
									<div class="ability-content">
										<div class="ability-icon-wrapper">
											<img :src="getPassiveImageUrl(selectedChampion?.passive)"
												:alt="selectedChampion?.passive.full" class="ability-icon-passive" />
										</div>
									</div>
									<div class="tooltip-container">
										<div class="tooltip">
											<div class="tooltip-content">
												<div class="tooltip-header">
													<img :src="getPassiveImageUrl(selectedChampion?.passive)"
														:alt="selectedChampion?.passive.name"
														class="tooltip-spell-icon" />
													<span class="ability-label">P</span>
												</div>
												<h5 class="spell-name">{{ selectedChampion?.passive.name }}</h5>
												<p class="spell-description">{{
													selectedChampion?.passive.description }}
												</p>
											</div>
										</div>
									</div>
								</div>
								<div v-for="(spellData, index) in selectedChampionSpell" :key="index" class="ability">
									<div class="ability-icon-wrapper">
										<img :src="spellData.url" class="ability-icon" />
										<div class="cooldown">{{
											spellData.spell.cooldownBurn.split('/')[0] }}s</div>

										<div class="tooltip-container">
											<div class="tooltip">
												<div class="tooltip-content">
													<div class="tooltip-header">
														<img :src="spellData.url" :alt="spellData.spell.name"
															class="tooltip-spell-icon" />
														<span class="ability-label">{{
															getAbilityLabelByIndex(index)
														}}</span>
													</div>
													<h5 class="spell-name">{{ spellData.spell.name }}</h5>
													<div>
														<p class="spell-cooldown">Cooldown: <span class="value-text">{{
															spellData.spell.cooldownBurn
														}}</span></p>
														<p class="spell-cost">Cost: <span class="value-text">{{
															spellData.spell.costBurn
														}}</span>
														</p>
													</div>
													<p class="spell-description">{{ spellData.spell.description
														}}
													</p>
												</div>
											</div>
										</div>
									</div>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Overlay for Summoner Spell Selection -->
	<!-- 
									<div class="tooltip-container">

								<div class="tooltip">
									<div class="tooltip-content">
										<div class="tooltip-header">
											<img :src="getPassiveImageUrl(selectedChampion?.passive)"
												:alt="selectedChampion?.passive.name" class="tooltip-spell-icon" />
											<span class="ability-label">P</span>
										</div>
										<h5 class="spell-name">{{ selectedChampion?.passive.name }}</h5>
										<p class="spell-description">{{ selectedChampion?.passive.description }}</p>
									</div>

								</div>
							</div>
									<div class="tooltip-container">
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

		<div class="summoner-spells-container">
							<div v-for="(spell, index) in selectedSpells" :key="spell.id" class="summoner-ability">
								<div class="summoner-ability-icon-wrapper" @click="openSpellSelector(index, $event)">
									<img :src="getSummonerSpellImageUrl(spell)" :alt="spell.name"
										class="summoner-ability-icon" />
								</div>
								<div v-if="isOverlayVisible && currentSpellIndex === index" class="overlay-grid">
									<div v-for="option in availableSummonerSpells" :key="option.id"
										class="overlay-grid-item" @click="selectSpell(option, index)">
										<img :src="getSummonerSpellImageUrl(option)" :alt="option.name"
											class="overlay-spell-icon" />
									</div>
								</div>
							</div>
						</div> -->
</template>

<script>
import { useStore, mapActions } from 'vuex';
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { getUrlHelper } from '../globalSetup';
import ImageUrlHelper from '../utils/imageHelper';
import SharedNotesModal from './reuse/NotesShareModal.vue';

import { gsap } from "gsap";

import Debug from 'debug';
const debug = Debug('app:component:ChampionSelection');





export default {
	components: {
		SharedNotesModal
	},
	props: {
		instanceId: {
			type: Number,
			required: true
		}
	},
	emits: ['championSelected'], // Declare custom events here
	setup(props, { emit }) {
		const championA = computed(() => store.getters['matchups/getChampionA']);
		const championB = computed(() => store.getters['matchups/getChampionB']);
		const store = useStore();

		const showNotesModal = ref(false);
		const showMatchupNotesModal = ref(false);
		const NotesSharedModalRef = ref(null);
		const MatchupNotesModalRef = ref(null);
		const currentMatchup = computed(() => store.getters['matchups/getCurrentMatchup']);

		const elementToAnimate = ref(null);
		const showInput = ref(false);
		const imageUrlHelper = new ImageUrlHelper();
		const favoriteChampions = computed(() => store.state.userPreferences.favoriteChampions);
		const championPicked = ref(false);

		const getStatImageUrl = (statKey) => imageUrlHelper.getStatImageUrl(statKey);

		const fetchOtherUsersNotes = (type) => {
			if (type === 'matchup') {
				store.dispatch('notes/fetchOtherUsersMatchupNotes', currentMatchup.value.combinedId);
				MatchupNotesModalRef.value?.fetchData(currentMatchup.value.combinedId);
			} else {
				store.dispatch('notes/fetchOtherUsersChampionNotes', championA.value.id);
				NotesSharedModalRef.value?.fetchData(championA.value.id);
			}
		};
		watch([showNotesModal, showMatchupNotesModal], async ([newValChampion, newValMatchup]) => {
			if (newValChampion === true) {
				fetchOtherUsersNotes('champion');
			}
			if (newValMatchup === true) {
				fetchOtherUsersNotes('matchup');
			}
		}, { immediate: false });

		const toggleFavorite = (champion) => {
			const isFav = favoriteChampions.value.some(c => c.id === champion.id);
			if (isFav) {
				// Remove the champion from favorites
				const updatedFavorites = favoriteChampions.value.filter(c => c.id !== champion.id);
				store.dispatch('userPreferences/updateFavoriteChampions', updatedFavorites);
			} else {
				// Add the champion to favorites
				const updatedFavorites = [...favoriteChampions.value, champion];
				store.dispatch('userPreferences/updateFavoriteChampions', updatedFavorites);
			}
		};

		const isFavorite = (champion) => {
			return favoriteChampions.value.some(c => c.id === champion.id);
		};

		const toggleSearch = () => {
			showInput.value = !showInput.value;
			if (showInput.value) {
				nextTick(() => {
					searchInput.value.focus();
				});
			}
		};
		const getInstanceIdRef = el => {
			if (props.instanceId === 1 || props.instanceId === 2) {
				elementToAnimate.value = el;
			}
		};

		const blueAnimation = () => {
			gsap.to(elementToAnimate.value, {
				boxShadow: '0 0 6px 8px rgba(0, 253, 255, .1)', // Blue glow
				repeat: 1, // repeat indefinitely
				yoyo: true, // go back and forth
				ease: 'power1.inOut',
				duration: 1,
				scale: .9,
			});
		};

		// Define the animation for the red theme
		const redAnimation = () => {
			gsap.to(elementToAnimate.value, {
				boxShadow: '0 0 6px 8px rgba(255, 0, 0, 0.2)', // Red glow
				repeat: 1, // repeat indefinitely
				yoyo: true, // go back and forth
				ease: 'power1.inOut',
				duration: 1,
				scale: .9
			});
		};
		return {
			elementToAnimate, blueAnimation, redAnimation, getInstanceIdRef, showInput,
			toggleSearch, toggleFavorite, isFavorite, favoriteChampions, getStatImageUrl, championPicked, showNotesModal, showMatchupNotesModal, fetchOtherUsersNotes, championA, championB,
			NotesSharedModalRef, MatchupNotesModalRef
		};
	},
	data() {
		return {
			loading: true, // Initial loading state
			showFavorites: false,
			isButtonHovered: false,
			isPopupHovered: false,
			baseUrl: '', // Initialize the baseUrl
			championImageUrls: {},
			championImageUrl: '',
			isGridOpen: false,
			searchTerm: '',
			isStatsVisible: false,
			champions: [],
			selectedChampion: null,
			selectedChampionPassiveUrl: '',
			selectedChampionSpell: [],
			selectedChampions: [],
			isGridVisible: false,
			championSelectedFromClient: null, // This will hold the auto-selected champion
			selectedStatKeys: ['hp', 'armor', 'spellblock', 'movespeed'],
			abilityLabels: ['Q', 'W', 'E', 'R'],
			isStatsCollapsed: false,
			//Summoner Spells
			allSummonerSpells: [
				{ id: 'SummonerHeal', name: 'Heal', image: { full: 'SummonerHeal.png' } },
				{ id: 'SummonerHaste', name: 'Ghost', image: { full: 'SummonerHaste.png' } },
				{ id: 'SummonerBarrier', name: 'Barrier', image: { full: 'SummonerBarrier.png' } },
				{ id: 'SummonerExhaust', name: 'Exhaust', image: { full: 'SummonerExhaust.png' } },
				{ id: 'SummonerMana', name: 'Clarity', image: { full: 'SummonerMana.png' } },
				{ id: 'SummonerFlash', name: 'Flash', image: { full: 'SummonerFlash.png' } },
				{ id: 'SummonerTeleport', name: 'Teleport', image: { full: 'SummonerTeleport.png' } },
				{ id: 'SummonerSmite', name: 'Smite', image: { full: 'SummonerSmite.png' } },
				{ id: 'SummonerBoost', name: 'Cleanse', image: { full: 'SummonerBoost.png' } },
				{ id: 'SummonerDot', name: 'Ignite', image: { full: 'SummonerDot.png' } },
				// Add other spells here...
			],
			selectedSpells: [],
			isOverlayVisible: false,
			currentSpellIndex: null,
			defaultSpells: [
				{ id: 'SummonerFlash', name: 'Flash', image: { full: 'SummonerFlash.png' } },
				{ id: 'SummonerDot', name: 'Ignite', image: { full: 'SummonerDot.png' } },
			],
			cleanups: [],
			showRestrictionPopup: false
		};
	},

	async mounted() {
		const store = useStore();
		let { championA, championB } = store.state.matchups;
		if (!championA) {
			championA = {
				id: "Hwei"
			}
		}
		if (!championB) {
			championB = {
				id: "Azir"
			}
		}
		// Retrieve champion details
		const championDetails = store.state.champions.championDetails;
		this.champions = championDetails ? Object.values(championDetails) : [];

		const preselectedChampionId = this.instanceId === 1 ? championA?.id : championB?.id;
		const preselectedChampion = this.champions.find(champion => champion.id === preselectedChampionId);

		if (preselectedChampion) {
			await this.selectChampion(preselectedChampion);
		}
		await Promise.all(this.filteredChampions.map(async (champion) => {
			this.championImageUrls[champion.id] = await this.getChampionImageSource('small', champion.id);
		}));

		this.loading = false; // Start with loading state

		if (this.instanceId === 1) {
			const cleanUpChampionSelected = window.ws.receive("champion-selected", (championId) => {
				if (championId && this.selectedChampion?.key !== championId) {
					this.fetchChampionById(championId).then(champion => {
						this.selectChampion(champion);
					});
				}
			});

			const cleanUpSessionUpdate = window.ws.receive("champ-select-session-update", (session) => {
				// debug("champ-select-session-update", session);
			});

			const cleanUpPhaseUpdate = window.ws.receive("champ-select-phase-update", (phase) => {
				if (phase === "BAN_PICK") {
					debug("Phase:", phase);
				} else if (phase === "BAN") {
					debug("Phase:", phase);
				} else if (phase === "PICK") {
					debug("Phase:", phase);
				} else if (phase === "FINALIZATION") {
					debug("Phase:", phase);
				} else if (phase === '') {
					debug("Phase:", phase);
				}
			});

			const cleanUpChampionPicked = window.ws.receive("champion-picked", (championId) => {
				if (championId && this.selectedChampion?.key !== championId) {
					this.fetchChampionById(championId).then(champion => {
						this.selectChampion(champion);
					});
				}
				this.championPicked = true;
				this.isGridVisible = false;
				setTimeout(() => {
					this.championPicked = false;
				}, 4000);
			});
			this.cleanups.push(cleanUpChampionSelected, cleanUpSessionUpdate, cleanUpPhaseUpdate, cleanUpChampionPicked);
		}
	},
	onBeforeUnmount() {
		this.cleanups.forEach(cleanup => cleanup()); // Call each cleanup function
	},
	computed: {
		fetchChampionById() {
			return async (key) => {
				const championList = computed(() => this.$store.getters['champions/getChampionDetails']);
				const champions = championList.value ? Object.values(championList.value) : [];
				return champions.find(champion => champion.key === String(key.toString()));
			};
		},
		championImageSource(type, championId) {
			return this.getChampionImageSource(type, championId);
		},
		availableSummonerSpells() {
			// Filter out the currently selected spells from the allSummonerSpells array
			return this.allSummonerSpells.filter(spell => {
				return !this.selectedSpells.includes(spell);
			});
		},
		filteredChampions() {
			if (!this.searchTerm) return this.champions;
			return this.champions.filter(champion =>
				champion.name.toLowerCase().includes(this.searchTerm.toLowerCase())
			);
		},
		themeClass() {
			return this.instanceId === 1 ? 'blue-theme' : 'red-theme';
		},
		championBackgroundStyle() {
			if (this.selectedChampion) {
				const urlHelper = getUrlHelper();
				const imageUrl = urlHelper.getChampionImageSource('splash', this.selectedChampion.id);

				return {
					backgroundImage: `url('${imageUrl}')`,
					opacity: 0.2
				};
			}
			return {};
		},
	},
	methods: {
		outsideClickHandler() {
			this.isGridVisible = false;
		},
		handleMouseEnter() {
			this.isButtonHovered = true;
			this.showFavorites = true;
		},
		handleMouseLeave() {
			this.isButtonHovered = false;
			// Delay hiding to allow moving to the popup
			this.delayHidePopup();
		},
		handleMouseLeaveGrid() {
			this.isGridVisible = false;
			this.isGridOpen = false;
		},
		handlePopupMouseEnter() {
			this.isPopupHovered = true;
		},
		handlePopupMouseLeave() {
			this.isPopupHovered = false;
			// Delay hiding to provide a smoother experience
			this.delayHidePopup();
		},
		delayHidePopup() {
			setTimeout(() => {
				if (!this.isButtonHovered && !this.isPopupHovered) {
					this.showFavorites = false;
				}
			}, 100); // Adjust delay as needed
		},
		async selectSpell(selectedSpell, index) {
			// Update local component state first
			const updatedSpells = [...this.selectedSpells];
			updatedSpells[index] = selectedSpell;
			this.selectedSpells = updatedSpells;
			this.currentSpellIndex = null;
			this.isOverlayVisible = false;

			// Now, update the Vuex state
			const selectedChampion = this.selectedChampion; // Make sure this is defined in your data or comes from props

			try {
				await this.$store.dispatch('champions/updateCustomChampionData', {
					championId: selectedChampion.id,
					dataToUpdate: updatedSpells,
					type: 'summoner-spells',
				});

				// If you need to refetch data from the server
				await this.$store.dispatch('champions/fetchCustomChampionData', {
					championId: selectedChampion.id,
				});
			} catch (error) {
				console.error('Failed to update summoner spell selection:', error);
			}
		},
		getFirstCooldown(cooldownString) {
			return cooldownString.split('/')[0];
		},
		toggleStats() {
			this.isStatsCollapsed = !this.isStatsCollapsed;
		},
		getPassiveImageUrl(passive) {
			const urlHelper = getUrlHelper();
			return urlHelper.getPassiveImageUrl(passive);
		},
		getSpellImageUrl(spell) {
			const urlHelper = getUrlHelper();
			return urlHelper.getSpellImageUrl(spell);

		},
		getSummonerSpellImageUrl(spell) {
			const baseImgPath = './img/dragontail/13.21.1/img/spell/';
			// Assuming the spell object has a property 'id' that starts with 'Summoner'
			return `${baseImgPath}${spell.id}.png`; // Adjust the file extension if necessary
		},
		openSpellSelector(index, event) {
			// Prevents the overlay from closing if the user clicks on the spell icon again
			event.stopPropagation();
			this.currentSpellIndex = index;
			this.isOverlayVisible = true;
		},
		...mapActions(['updateSelectedSpells']),

		openSpellSelector(index, event) {
			this.currentSpellIndex = index;
			this.isOverlayVisible = !this.isOverlayVisible;
			event.stopPropagation();
		},
		getAbilityLabelByIndex(index) {
			return this.abilityLabels[index] || ''; // Fallback to empty string if index is out of range
		},
		checkScrollable() {
			const gridContainer = this.$refs.gridContainer; // You'll need to add a ref="gridContainer" to the element
			if (gridContainer.scrollHeight > gridContainer.clientHeight) {
				gridContainer.classList.add('is-scrollable');
			} else {
				gridContainer.classList.remove('is-scrollable');
			}
		},
		syncWithClient() {
			// Logic to sync with the League client and fetch the selected champion
			// For example, this could be set based on a response from an API call:
			// this.championSelectedFromClient = responseFromClient;
			this.isGridVisible = true; // Show the grid after syncing
		},
		showGrid() {
			this.isGridVisible = true;
		},

		// Method to hide the grid if you need it
		hideGrid() {
			this.isGridVisible = false;
			this.searchTerm = ""; // Optionally reset the search term when hiding the grid
		},
		filterChampions() {
			if (!this.searchTerm) return this.champions;
			this.filteredChampions = this.champions.filter(champion => {
				return champion.name.toLowerCase().includes(this.searchTerm.toLowerCase());
			});
		},
		async selectChampion(champion) {
			// Prevent selecting the same champion in both instances
			if ((this.instanceId === 1 && this.championB?.id === champion.id) ||
				(this.instanceId === 2 && this.championA?.id === champion.id)) {
				this.showRestrictionPopup = true; // Show restriction popup
				return; // Stop selection if the champion is already selected in the other instance
			}

			// Proceed with champion selection logic
			// this.animateChampion();
			this.selectedChampion = champion;

			// Fetch and store passive image URL
			this.selectedChampionPassiveUrl = this.getPassiveImageUrl(champion.passive);

			// Fetch and store spell image URLs along with spell data
			this.selectedChampionSpell = champion.spells.map(spell => ({
				spell: spell,
				url: this.getSpellImageUrl(spell)
			}));

			this.hideGrid();
			console.debug('Selected champion:', this.selectedChampion);

			// Assuming 'championCustomData' is part of your component's data and is reactive
			this.$nextTick(() => {
				// Update the champion data with default spells
				const championCustomData = this.$store.state.champions.championCustomData;

				this.championCustomData = updateChampionDataWithDefaultSpells(championCustomData);

				// Use the updated data to set the selectedSpells
				const championSpells = this.championCustomData[champion.id]?.summonerSpells || this.defaultSpells;

				this.selectedSpells = championSpells;
				// this.animateChampion();
			});

			this.$emit('championSelected', this.selectedChampion);

			// Make sure 'defaultSpells' is defined in your component's data
			const defaultSpells = [
				{ id: 'SummonerFlash', name: 'Flash', image: { full: 'SummonerFlash.png' } },
				{ id: 'SummonerDot', name: 'Ignite', image: { full: 'SummonerDot.png' } },
			];

			// Update champion data function
			function updateChampionDataWithDefaultSpells(championData) {
				Object.keys(championData).forEach(championKey => {
					if (!championData[championKey].summonerSpells || championData[championKey].summonerSpells.length === 0) {
						championData[championKey].summonerSpells = [...defaultSpells];
					}
				});
				return championData;
			}
		},
		closeRestrictionPopup() {
			this.showRestrictionPopup = false; // Hide the popup when the user clicks OK
		},
		animateChampion() {
			const animation = this.instanceId === 1 ? this.blueAnimation : this.redAnimation;
			if (animation && this.elementToAnimate) {
				animation();
			}
		},
		async getChampionImageSource(type, championId) {
			const urlHelper = getUrlHelper();
			return urlHelper.getChampionImageSource(type, championId);
		}
	}
};
</script>

<style scoped>
.restriction-popup {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #333;
	color: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	z-index: 1000;
	width: 80%;
	max-width: 300px;
	text-align: center;
}

.restriction-popup button {
	margin-top: 10px;
	padding: 5px 10px;
	background-color: #555;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.shared-button {
	bottom: -4rem;
	right: 2rem;
	z-index: 1;

}


.button-container {
	display: flex;
	justify-content: center;
	align-items: center;
}

.test {
	z-index: 111;
	background-color: red;
}

/* Fade In Animation */
@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

/* Fade Out Animation */
@keyframes fadeOut {
	from {
		opacity: 1;
	}

	to {
		opacity: 0;
	}
}

/* Transition Classes */
.fade-enter-active,
.fade-leave-active {
	animation-duration: 0.5s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
	opacity: 1;
}

.fade-enter-active {
	animation-name: fadeIn;
}

.fade-leave-active {
	animation-name: fadeOut;
}

.champion-picked {
	border: 2px solid var(--gold-4);
}

.loading-indicator {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	z-index: 1000;
	color: red;
	font-size: 20px;
}

.favorite-icon {
	cursor: pointer;
	margin: 5px;
}

.favorite-icon,
.favorite-icon .fa {
	cursor: pointer;
}

.favorite-icon.is-favorite .fa-star {
	color: gold;
}

.favorite-icon.is-favorite .fa:active {
	color: darkgoldenrod;
}

.favorite-icon:active {
	transform: scale(0.9);
}

.favorite-icon:hover .fa-star {
	transform: scale(1.2);
}

.fav-button {
	position: relative;
	cursor: pointer;
	border-radius: 6px;
	color: var(--gold-1);
}

.fav-button:hover {
	color: var(--gold-2)
}

.fav-header {
	display: flex;
	font-size: 1.15rem;
}

.fav-header span {
	display: flex;
	margin-left: 2px;
}

.fav-popup {
	position: absolute;
	top: -10px;
	right: 120%;
	background: var(--grey-4);
	border: 1px solid var(--grey-3);
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	z-index: 1111;
	min-width: 182px;
}


.fav-item {
	display: flex;
	align-items: center;
	width: calc(25%);
}


.fav-item img {
	display: flex;
	align-items: center;
	width: 45px;
	height: 45px;
}

.fav-item img:hover {
	border: 1px solid var(--gold-4);
}


.champion-image {
	width: 40px;
	height: 30px;
	cursor: pointer;
}

.stat-toggle-container {
	position: absolute;
	left: 10px;
	top: 25px;
}

.background-image {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
	background-size: cover;
	background-position: top center;
	background-repeat: no-repeat;
}

.spell-selection-overlay {
	position: fixed;
	/* Or absolute depending on use case */
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 10;
	/* Make sure this is above everything else */
}

.spell-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
	gap: 10px;
	padding: 20px;
	max-width: 90vw;
	max-height: 80vh;
	overflow-y: auto;
}

.spell-option {
	cursor: pointer;
	/* Indicate the items are clickable */
	text-align: center;
	/* Center the text under the image */
}

.spell-name {
	margin-top: 5px;
	/* Space between image and text */
	color: white;
	/* Text color */
}

.overlay-grid-item {
	width: 50px;
	height: 50px;
	border: 1px solid #333;
	border-radius: 4px;
	overflow: hidden;
}

.overlay-spell-icon {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.overlay-grid {
	position: absolute;
	top: 100%;
	left: 0;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 5px;
	background: #000;
	border: 1px solid #555;
	z-index: 5;
}

.summoner-spells-container {
	display: flex;
	position: relative;
	justify-content: center;
	align-items: start;
	margin-left: 1rem;

}

.summoner-ability {
	border: 2px solid var(--gold-4);
	margin: 0 5px;
}

.summoner-ability-icon-wrapper {
	position: relative;
	display: inline-block;
}

.summoner-ability-icon {
	width: 35px;
	height: 35px;
}

.summoner-ability-label {
	position: absolute;
	bottom: -20px;
	left: 50%;
	transform: translateX(-50%);
	color: #FFFFFF;
	font-size: 0.75rem;
	text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.stats-icon {
	cursor: pointer;
	color: var(--gold-2);
}

.stats-tooltip {
	text-align: left;
	position: absolute;
	right: -1%;
	bottom: 0;
	background-color: #000;
	padding: .5rem;
	z-index: 10;
	border-radius: 6px;
}

.btn-outline-secondary:hover+.stats-tooltip {
	display: block;
}

/* Button text color on hover (change it to your desired color) */
.btn.btn-outline-secondary:hover {
	border-radius: 80px;
	background-color: var(--navbar-background-elements);
}

.ability-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 0.25rem;
}

.cooldown {
	font-size: 0.75rem;
	font-weight: 500;
	color: var(--grey-1);
	bottom: -18px;
}

.cooldown-display {
	position: relative;
	height: 10px;
	font-size: 0.8rem;
}

.cooldown-display:hover .full-cooldown {
	display: block;
}

.stat-toggle-icon {
	width: 24px;
	height: 24px;
	cursor: pointer;
}

.champion-content {
	display: flex;
	color: #fff;
}

.champion-detail-container {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;

}

.champion-detail-wrapper {
	display: flex;
}

.champion-detail--instance2 {
	display: flex;

}

.champion-detail--instance1 .champion-abilities,
.champion-detail--instance2 .champion-abilities {
	display: flex;
}



.stats-container {
	display: flex;
	align-items: center;
}

.stat-item {
	font-size: 0.875rem;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-bottom: 0px;
}

.abilities-container {
	display: flex;
	justify-content: flex-start;
	gap: 0.5rem;
}

.abilities-container img {
	width: 38px;
	height: auto;
}

.champion-abilities-card {
	margin: 10px auto;
}

.ability {
	display: flex;
}

.ability-icon-wrapper {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
}

.ability-label {
	font-size: 1rem;
	font-weight: 700;
	color: #fff;
	position: absolute;
	bottom: 0;
	right: 0;
	padding: 2px 4px;
	border-radius: 2px;
	text-shadow: none;
}

.tooltip-container {
	position: relative;
	transition: visibility 0.2s, opacity 0.2s ease-in-out;
}

.ability:hover .tooltip-container {
	display: block;
}

.tooltip {
	position: absolute;
	border: 1px solid var(--grey-3);
	/* Aligns the tooltip above the ability icon */
	left: 50%;
	transform: translateX(-50%);
	visibility: hidden;
	opacity: 0;
	background-color: var(--hextech-black);
	color: var(--grey-1);
	padding: 1rem 2rem;
	border-radius: 0.25rem;
	z-index: 999;
	min-width: 300px;
	margin-top: .5rem;
}

.tooltip .ability-label {
	bottom: 1rem;
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

.tooltip-spell-icon,
.ability-icon {
	width: 30px;
	height: 30px;
	margin: 0 5px;
	border: 1px solid #ccc;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.ability-icon:hover {
	/* transform: translateY(-5px); */
}

.ability-icon-passive {
	width: 25px !important;
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

.ability:hover .tooltip {
	visibility: visible;
	opacity: 1;
	z-index: 10;
	transition-delay: 0.1s;
}

.value-text {
	color: var(--blue-laser-1);
}

.note-card {
	color: #e7e7de;
	border-radius: 10px;
	transition: transform 0.3s ease;
	user-select: none;
}

.champion-abilities {
	display: flex;
	flex-wrap: wrap;
	gap: 0rem;
}

.champion-card {
	display: flex;
	min-height: 260px;
	flex-direction: column;
	padding: 0 .5rem;
}

.champion-portrait {
	margin-top: .5rem;
	padding: 1rem 0rem;
	display: flex;
	justify-content: center;
	align-items: center;
}

.champion-portrait img {
	width: 90px;
	height: 90px;
	border-radius: 2px;
}

.champion-info {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	flex-grow: 1;
	padding: 1rem;
}

.champion-name-container {
	display: flex;
	justify-content: space-between;
}

.champion-name {
	font-size: 1.8rem;
	font-weight: bold;
}

/* Adjust the grid container */
.champion-grid-container {
	position: relative;
	flex-basis: auto;
	overflow-y: auto;
}

.champion-grid-container.open {
	flex: 1;
	max-height: 300px;
}

.champion-grid {
	justify-content: start;
	display: flex;
	flex-wrap: wrap;
	gap: 0;
	padding-top: .25rem;
}

.champion-grid.is-scrollable {
	padding-right: 1rem;
}

.slim-row {
	top: 0;
	z-index: 100;
	position: fixed;
	justify-content: center;
	height: auto;
	flex-grow: 0;
}


.search-bar .input-group-text {
	height: 30px;
	color: var(--gold-2);
	background: var(--grey-cool);
	border: 0;
	z-index: 100;
}

.search-bar input.form-control::placeholder {
	color: var(--grey-1);
}

.search-container .input-group {
	display: flex;
	align-items: center;
}

.search-container .input-group-text {
	cursor: pointer;
	z-index: 2;
	/* Ensures the icon stays above the input field */
}

.search-container input {
	transition: width 0.3s ease, padding 0.3s ease;
	width: 0;
	padding: 0;
	border: none;
	position: absolute;
	right: 0;
	opacity: 0;
}

.search-container input:focus {
	outline: none;
}

.search-container .input-group input:focus,
.search-container .search-bar.active input {
	width: 100%;
	padding: .375rem;
	opacity: 1;
	position: static;
	background-color: var(--grey-cool);
	text-align: start;
	border: none;
	color: var(--gold-1);
	font-size: 0.75rem;
	max-width: 65%;
}

.input-group .input-group-text {
	opacity: 0.5;
}

.search-container .input-group input {
	width: 100%;
	padding: .375rem;
	opacity: 0.5;
	position: static;
	background-color: var(--grey-cool);
	text-align: start;
	color: var(--gold-1);
	font-size: 0.75rem;
	max-width: 65%;
}

.champion-tile {
	width: 50px;
	background: var(--hextech-black);
	border: 0px solid var(--blue-7);
}

.champion-tile:hover {
	transform: scale(1.05);
}

.champion-tile img {
	max-width: 100%;
	display: block;
}

.champion-tile span {
	display: block;
	text-shadow: 1px 1px 2px var(--blue-6);
	text-align: center;
	color: var(--gold-2);
	display: block;
	font-size: 1rem;
}

.champion-image:hover {
	transform: scale(1.05);
}

.champion-grid::-webkit-scrollbar {
	padding-right: 10px;
	width: .75rem;
}

.blue-theme .champion-grid::-webkit-scrollbar-thumb {
	background-color: var(--blue-laser-1);
	border-radius: 6px;
	height: 2rem;
}

.champion-grid::-webkit-scrollbar-track {
	background-color: var(--navbar-background-elements);
}

.red-theme .champion-grid::-webkit-scrollbar-thumb {
	background-color: var(--red-laser-1);
	border-radius: 6px;
	height: 2rem;
}

.blue-theme .champion-image {
	will-change: box-shadow, border-color;
	box-shadow: 0 0 2px 0px rgba(0, 253, 255, .3);
	border: 1px solid #10ffff38;
}

.red-theme .champion-image {
	will-change: box-shadow, border-color;
	box-shadow: 0 0 2px 0px rgba(255, 0, 0, .3);
	border: 1px solid #fe10103d;
}


@keyframes blue-glow {

	0% {
		box-shadow: 0 0 1px 12px rgba(0, 253, 255, 1);
		border-color: #10FEFF;
	}

	50% {
		box-shadow: 0 0 1px 2px rgba(0, 253, 255, .5);
		border-color: #10FEFF;
	}

	100% {
		box-shadow: 0 0 1px 12px rgba(0, 253, 255, 1);
		border-color: #10FEFF;
	}
}

@keyframes red-glow {

	0% {
		box-shadow: 0 0 1px 2px rgba(255, 0, 0, 1);
		border-color: #FE1010;
	}

	50% {
		box-shadow: 0 0 1px 2px rgba(255, 0, 0, .5);
		border-color: #FE1010;
	}

	100% {
		box-shadow: 0 0 1px 2px rgb(255, 0, 1);
		border-color: #FE1010;
	}
}


/* Responsive Design */
@media (max-width: 813px) {
	.abilities-container {
		flex-direction: column;
		/* Stack abilities vertically on small screens */
	}

	.ability-icon {
		margin-bottom: 0.5rem;
		/* Add space between stacked icons */
	}
}

/*
.blue-theme {
	border-bottom: 3px solid #00ffea81;
}

.red-theme {
	border-bottom: 3px solid rgba(223, 58, 58, 0.5);
}
*/
.blue-themex {
	border-radius: 10px;
	box-shadow:
		0 0 5px #00ffea52,
		0 0 10px #00ffea52,
		0 0 20px #00ffea52,
		0 0 30px #00ffea52,
		0 0 40px #00ffea52;
}

.blue-theme:hoverx {
	box-shadow:
		0 0 10px #00ffea52,
		0 0 15px #00ffea52,
		0 0 25px #00ffea52,
		0 0 35px #00ffea52,
		0 0 45px #00ffea52;
}

.red-themex {
	border-radius: 10px;
	box-shadow:
		0 0 5px rgba(223, 58, 58, 0.35),
		0 0 10px rgba(223, 58, 58, 0.35),
		0 0 20px rgba(223, 58, 58, 0.35),
		0 0 30px rgba(223, 58, 58, 0.35),
		0 0 40px rgba(223, 58, 58, 0.35);
}

.red-theme:hoverx {
	box-shadow:
		0 0 10px rgba(223, 58, 58, 0.35),
		0 0 15px rgba(223, 58, 58, 0.35),
		0 0 25px rgba(223, 58, 58, 0.35),
		0 0 35px rgba(223, 58, 58, 0.35),
		0 0 45px rgba(223, 58, 58, 0.35);
}
</style>
