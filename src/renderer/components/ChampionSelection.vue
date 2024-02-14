<template>
	<div>
		<div class="note-card champion-card">
			<div class="background-image-container" :style="championBackgroundStyle"></div>
			<div class="d-flex justify-content-between align-items-center">
				<div class="search-container">
					<div class="search-bar position-relative">
						<div class="input-group">
							<span class="input-group-text" @click="showGrid">
								<i class="fa-solid fa-search fa-xs"></i>
							</span>
							<input type="text" @click="showGrid" v-model="searchTerm" @input="filterChampions"
								placeholder="Search Champion" class="form-control" />
						</div>
					</div>
				</div>
				<div class="fav-button" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
					v-if="instanceId === 1">
					<div class="fav-header">
						<i class="fa-solid fa-star fa-sm"></i>
						<span></span>
					</div>
					<div class="fav-popup" v-if="showFavorites" @mouseenter="handlePopupMouseEnter"
						@mouseleave="handlePopupMouseLeave">
						<div v-for="champion in favoriteChampions" :key="champion.id" class="fav-item"
							@click="selectChampion(champion)">
							<img :src="championImageUrls[champion.id]" alt="Champion Image" />
						</div>
					</div>
				</div>
			</div>

			<!-- Champion Grid Container -->
			<div class="champion-grid-container" :class="{ 'open': isGridVisible }">
				<!-- Champion Grid -->
				<div class="champion-grid" v-show="isGridVisible">
					<div v-for="champion in filteredChampions" :key="champion.id" class="champion-tile"
						@click="selectChampion(champion)">
						<img :src="championImageUrls[champion.id]" alt="Champion Image" />
						<!-- <span>{{ champion.name }}</span> -->
					</div>
				</div>
			</div>

			<div class="champion-detail-container" v-if="selectedChampion" v-show="!isGridVisible">
				<div class="champion-detail-wrapper champion-detail--instance1 " v-if="instanceId === 1">
					<div :class="[themeClass, 'champion-content']">
						<!-- Champion Image Container -->
						<div class="champion-portrait">
							<img class="champion-image" :src="championImageUrls[selectedChampion.id]" alt="Champion Image"
								@click="showGrid" />
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
												<img :src="selectedChampionPassiveUrl" :alt="selectedChampion?.passive.full"
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
													<p class="spell-description">{{ selectedChampion?.passive.description }}
													</p>
												</div>
											</div>
										</div>
									</div>
									<div v-for="(spellData, index) in selectedChampionSpell" :key="index" class="ability">
										<div class="ability-icon-wrapper">
											<img :src="spellData.url" class="ability-icon" />
											<!-- <div class="cooldown">{{ spell.cooldownBurn.split('/')[0] }}</div> -->
											<div class="tooltip-container">
												<div class="tooltip">
													<div class="tooltip-content">
														<div class="tooltip-header">
															<img :src="spellData.url" :alt="spellData.spell.name"
																class="tooltip-spell-icon" />
															<span class="ability-label">{{ getAbilityLabelByIndex(index)
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
														<p class="spell-description">{{ spellData.spell.description }}</p>
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


				<!-- Instance 2: Icon Left + Icons Right -->
				<div class="champion-detail-wrapper champion-detail--instance2 " v-if="instanceId === 2">
					<!-- Champion Image Container -->
					<div :class="[themeClass, 'champion-content']">
						<!-- Champion Image Container -->
						<div class="champion-portrait">
							<img class="champion-image" :src="championImageUrls[selectedChampion.id]"
								alt="Champion Image" />
						</div>
						<div class="champion-info">
							<div class="champion-name-container">
								<div class="champion-name">{{ selectedChampion.name }}</div>
								<div class="stats-container">
									<div @mouseover="isStatsVisible = true" @mouseleave="isStatsVisible = false">
										<img :src="getStatImageUrl('statToggle')" alt="Toggle Stats"
											class="stat-toggle-icon" />
										<!-- <img :src="getStatImageUrl('statToggle')" alt="Toggle Stats" class="stat-toggle-icon" /> -->
									</div>
									<div class="stats-tooltip-container collapse" :class="{ show: !isStatsCollapsed }">
										<div v-show="isStatsVisible" class="stats-tooltip">
											<!-- Iterate through your selected stats -->
											<div class="stat-item d-flex align-items-center"
												v-for="statKey in selectedStatKeys" :key="statKey">
												<div class="stat-value">{{ selectedChampion.stats[statKey] }}</div>
												<img :src="getStatImageUrl(statKey)" :alt="statKey" class="stat-icon" />
											</div>
										</div>
									</div>
								</div>
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
													<p class="spell-description">{{ selectedChampion?.passive.description }}
													</p>
												</div>
											</div>
										</div>
									</div>
									<div v-for="(spellData, index) in selectedChampionSpell" :key="index" class="ability">
										<div class="ability-icon-wrapper">
											<img :src="spellData.url" class="ability-icon" />
											<!-- <div class="cooldown">{{ spell.cooldownBurn.split('/')[0] }}</div> -->
											<div class="tooltip-container">
												<div class="tooltip">
													<div class="tooltip-content">
														<div class="tooltip-header">
															<img :src="spellData.url" :alt="spellData.spell.name"
																class="tooltip-spell-icon" />
															<span class="ability-label">{{ getAbilityLabelByIndex(index)
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
														<p class="spell-description">{{ spellData.spell.description }}</p>
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
import { ref, computed, watch } from 'vue';
import { getUrlHelper } from '../globalSetup';

import gsap from 'gsap';
import Debug from 'debug';
const debug = Debug('app:component:ChampionSelection');

export default {
	props: {
		instanceId: {
			type: Number,
			required: true
		}
	},
	setup(props) {
		const elementToAnimate = ref(null);
		const showInput = ref(false);
		const store = useStore();

		const favoriteChampions = computed(() => {
			return store.state.userPreferences.favoriteChampions;
		});
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
				boxShadow: '0 0 4px 5px rgba(0, 253, 255, 0.7)', // Blue glow
				borderColor: '#41fcfc', // Light blue
				repeat: -1, // repeat indefinitely
				yoyo: true, // go back and forth
				ease: 'power1.inOut',
				duration: 3
			});
		};

		// Define the animation for the red theme
		const redAnimation = () => {
			gsap.to(elementToAnimate.value, {
				boxShadow: '0 0 6px 5px rgba(255, 0, 0, 0.7)', // Red glow
				borderColor: '#fa6969', // Light red
				repeat: -1, // repeat indefinitely
				yoyo: true, // go back and forth
				ease: 'power1.inOut',
				duration: 3
			});
		};
		return {
			elementToAnimate, blueAnimation, redAnimation, getInstanceIdRef, showInput,
			toggleSearch, favoriteChampions
		};
	},
	// watch: {
	// 	selectedChampion(newVal) {
	// 		this.searchTerm = newVal?.id;
	// 	}
	// },
	data() {
		return {
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
			selectedStatKeys: ['hp', 'armor', 'spellblock', 'attackdamage', 'movespeed'],
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
			]
		};
	},

	async mounted() {
		const store = useStore();
		const urlHelper = getUrlHelper();
		this.baseUrl = urlHelper.baseUrl;

		let { championA, championB } = store.state.matchups;

		if (!championA && !championB) {
			// If no champions are selected initially
			championA = {
				id: "Bard"
			}
			championB = {
				id: "Pyke"
			}
		}
		// Retrieve champion details
		const championDetails = store.state.champions.championDetails;
		this.champions = championDetails ? Object.values(championDetails) : [];

		// Determine the champion ID to preselect based on the component's instance
		const preselectedChampionId = this.instanceId === 1 ? championA?.id : championB?.id;

		// Find the corresponding champion in the details array using the ID
		const preselectedChampion = this.champions.find(champion => champion.id === preselectedChampionId);

		// If the preselected champion is found, select it
		if (preselectedChampion) {
			await this.selectChampion(preselectedChampion);
		}
		await Promise.all(this.filteredChampions.map(async (champion) => {
			this.championImageUrls[champion.id] = await this.getChampionImageSource('small', champion.id);
		}));
		await this.$store.dispatch('userPreferences/getFavoriteChampions');
	},


	computed: {
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
					opacity: 0.05
				};
			}
			return {};
		},
	},
	methods: {
		toggleFavorite(champion) {
			const index = this.favoriteChampions?.findIndex(c => c.id === champion.id);
			if (index > -1) {
				// Champion is already a favorite, remove them
				this.favoriteChampions.splice(index, 1);
			} else {
				// Add the whole champion object as a favorite
				this.favoriteChampions.push(champion);
			}
			this.$store.dispatch('userPreferences/updateFavoriteChampions', this.favoriteChampions);
		},
		isFavorite(champion) {
			return this.favoriteChampions?.some(c => c.id === champion.id);
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
			// Construct the URL for the passive image
			const imagePath = `./passive/${passive?.image.full}`;
			return this.baseUrl && imagePath ? `${this.baseUrl}/${imagePath}` : '';
		},
		getSpellImageUrl(spell) {
			const imagePath = `./spell/${spell.image.full}`;
			return this.baseUrl && imagePath ? `${this.baseUrl}/${imagePath}` : '';

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
		getStatImageUrl(statKey) {
			const statIcons = {
				AdaptiveForce: 'StatModsAdaptiveForceIcon.png',
				armor: 'StatModsArmorIcon.png',
				attackdamage: 'StatModsAttackDamageIcon.png',
				// CDR: 'StatModsCDRScalingIcon.png',
				hp: 'StatModsHealthScalingIcon.png',
				spellblock: 'StatModsMagicResIcon.png',
				// abilitypower: 'StatModsAbilityPowerIcon.png',
				movespeed: 'StatModsMovementSpeedIcon.png',
				statToggle: 'StatModsButton.png'
			};
			return `./img/dragontail/img/perk-images/StatMods/${statIcons[statKey]}`;
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
			this.selectedChampion = null; // Optionally reset the selected champion when showing the grid
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
			this.selectedChampion = champion;

			// Fetch and store passive image URL
			this.selectedChampionPassiveUrl = this.getPassiveImageUrl(champion.passive);

			// Fetch and store spell image URLs
			// Fetch and store spell image URLs along with spell data
			this.selectedChampionSpell = champion.spells.map(spell => ({
				spell: spell,
				url: this.getSpellImageUrl(spell)
			}));

			this.hideGrid();
			debug('Selected champion:', this.selectedChampion);


			// Assuming 'championCustomData' is part of your component's data and is reactive
			this.$nextTick(() => {
				// Update the champion data with default spells
				const championCustomData = this.$store.state.champions.championCustomData;

				this.championCustomData = updateChampionDataWithDefaultSpells(championCustomData);

				// Use the updated data to set the selectedSpells
				const championSpells = this.championCustomData[champion.id]?.summonerSpells || this.defaultSpells;

				this.selectedSpells = championSpells;
				this.animateChampion();
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
		animateChampion() {
			const animation = this.instanceId === 1 ? this.blueAnimation : this.redAnimation;
			if (animation && this.elementToAnimate) {
				animation();
			}
		},
		// getChampionImageSource(type, championId) {
		// 	const ddragonBaseUrl = 'https://ddragon.leagueoflegends.com/';
		// 	switch (type) {
		// 		case 'small':
		// 			// Assuming 'small' refers to the champion square assets
		// 			return `${ddragonBaseUrl}cdn/14.1.1/img/champion/${championId}.png`;
		// 		case 'loading':
		// 			// Loading screen images
		// 			return `${ddragonBaseUrl}img/champion/loading/${championId}_0.jpg`;
		// 		case 'splash':
		// 			// Full splash images
		// 			return `${ddragonBaseUrl}img/champion/splash/${championId}_0.jpg`;
		// 		case 'tiles':
		// 			// If 'tiles' refer to another type of image, adjust the path accordingly
		// 			return `${ddragonBaseUrl}cdn/14.1.1/img/tiles/${championId}_0.jpg`;
		// 		default:
		// 			return ''; // or some default path
		// 	}
		// }
		async getChampionImageSource(type, championId) {
			const urlHelper = getUrlHelper();
			return urlHelper.getChampionImageSource(type, championId);
		}
	}
};
</script>

<style scoped>
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
	/* Slightly darken the color when pressed */
}

/* Scale down when active/pressed to simulate a button press */
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
	color: var(--grey-1);
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
	top: -20px;
	right: 140%;
	background: var(--grey-4);
	border: 1px solid var(--grey-3);
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	z-index: 5;
	min-width: 182px;
}


.fav-item {
	display: flex;
	align-items: center;
	/* Maintain gap between items */
	width: calc(25%);
	/* Adjust width to fit 4 items per row, accounting for gap */
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
	height: 40px;
	object-fit: cover;
}

.stat-toggle-container {
	position: absolute;
	left: 10px;
	top: 25px;
}

.background-image-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
	background-size: cover;
	background-position: center;
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
	/* Match the ability icon size */
	height: 50px;
	/* Match the ability icon size */
	border: 1px solid #333;
	/* Match the ability icon border */
	border-radius: 4px;
	/* Optional, if ability icons have rounded corners */
	overflow: hidden;
	/* Keep the images within the bounds */
}

.overlay-spell-icon {
	width: 100%;
	height: 100%;
	object-fit: cover;
	/* Ensure the image covers the item area */
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
	/* Adjust as necessary to align with the rest of your layout */
	align-items: start;
	margin-left: 1rem;

}

.summoner-ability {
	border: 2px solid var(--gold-4);
	margin: 0 5px;
	/* Space between the summoner spell icons */
}

.summoner-ability-icon-wrapper {
	position: relative;
	display: inline-block;
}

.summoner-ability-icon {
	width: 35px;
	/* Adjust based on your icon size */
	height: 35px;
	/* Adjust based on your icon size */
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
	/* Add this line to right-align the content */
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
	color: white;
	margin-top: 4px;
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
	padding: .5rem;
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

.champion-image {
	cursor: pointer;
	border: px solid #fff;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	border-radius: 5px;
	transition: transform 0.3s ease;
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
	font-size: 0.8rem;
	color: #fff;
	position: absolute;
	bottom: 0;
	right: 0;
	padding: 2px 4px;
	background-color: rgba(0, 0, 0, 0.7);
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
	top: 100%;
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
	/* Other styles */
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
	transform: translateY(-5px);
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
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;
}

.champion-abilities {
	display: flex;
	flex-wrap: wrap;
	gap: 0rem;
}



.champion-card {
	display: flex;
	height: 300px;
	flex-direction: column;
	padding: 1.5rem;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

}



.champion-portrait {
	padding: 0.5rem;
	display: flex;
	align-items: flex-end;
}

.champion-portrait img {
	width: 90px;
	height: auto;
	border-radius: 5px;
	border: 2px solid var(--gold-4);
}

.champion-info {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	flex-grow: 1;
	padding: .5rem;
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
}

.champion-grid {
	justify-content: start;
	display: flex;
	flex-wrap: wrap;
	gap: 0;
	padding-top: 1rem;
}

.champion-grid.is-scrollable {
	padding-right: 1rem;
	/* Add some padding to the right to make room for the scrollbar */
}

.slim-row {
	top: 0;
	z-index: 100;
	position: fixed;
	justify-content: center;
	height: auto;
	/* Let the content define the height */
	flex-grow: 0;
}


.search-bar .input-group-text {
	height: 30px;
	color: var(--gold-1);
	background: var(--grey-cool);
	border: 0;
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

/*  .search-container .input-group:hover input, */
.search-container .input-group input:focus,
.search-container .search-bar.active input {
	width: 100%;
	/* Full width of container */
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

.champion-tile img {
	max-width: 100%;
	display: block;
}

.champion-tile span {
	display: block;
	text-shadow: 1px 1px 2px var(--blue-6);
	/* Make the span a block element to allow for text alignment */
	text-align: center;
	/* Center the text */
	color: var(--gold-2);
	display: block;
	font-size: 1rem;
}

.champion-image:hover {
	transform: scale(1.05);
}


/* Scrollbar styles for the search bar or its container */
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
	/* Black color for the track */
}

.red-theme .champion-grid::-webkit-scrollbar-thumb {
	background-color: var(--red-laser-1);
	border-radius: 6px;
	height: 2rem;
}

/*
.blue-theme .champion-image {
	will-change: box-shadow, border-color;
	border: 4px solid var(--blue-3);
	box-shadow: 0 0 5px 5px rgba(0, 253, 255, 1);
	border-color: #10FEFF;
	border: 2px solid #10FEFF;
	animation: blue-glow 1s ease-in infinite ; 
}
*/
/* 
.red-theme .champion-image {
	will-change: box-shadow, border-color;
	box-shadow: 0 0 5px 5px rgba(255, 0, 0, 1);
	border-color: #FE1010;
	border: 2px solid #fe1010;
}
*/
@keyframes blue-glow {

	0% {
		box-shadow: 0 0 3px 3px rgba(0, 253, 255, 1);
		border-color: #10FEFF;
	}

	100% {
		box-shadow: 0 0 3px 3px rgba(0, 253, 255, 10);
		border-color: #10FEFF;
	}
}

@keyframes red-glow {

	0% {
		box-shadow: 0 0 3px 3px rgba(255, 0, 0, 1);
		border-color: #FE1010;
	}

	100% {
		box-shadow: 0 0 3px 3px rgb(255, 0, 0);
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

.blue-theme {
	border-bottom: 3px solid #00ffea81;
}

.red-theme {

	border-bottom: 3px solid rgba(223, 58, 58, 0.5);
}

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
}</style>
