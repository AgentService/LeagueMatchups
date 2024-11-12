<template>
	<!-- Listbox Dropdown for Summoner Selection -->
	<Listbox as="div" :modelValue="currentSelection" @update:modelValue="selectSummoner">
		<div class="relative">
			<!-- Button to display current selection -->
			<ListboxButton
				class="relative w-full cursor-default rounded-md dark:hover:bg-gray-700 dark:bg-gray-900 py-1.5 pl-2 pr-10 text-left dark:text-gray-200 shadow-sm ring-1 ring-inset dark:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
				<span class="flex items-center">
					<img :src="getSummonerIcon(getSummonerProfileIcon(currentSelection))" alt="Summoner Icon"
						class="h-5 w-5 shrink-0 rounded-full" />
					<span class="ml-2 block truncate flex items-baseline">
						{{ getSummonerName(currentSelection) || 'Summoner' }}
						<span class="dark:text-gray-500 ml-1 text-xs">#{{ getSummonerTagLine(currentSelection) }}</span>
					</span>
				</span>

				<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
					<ChevronUpDownIcon class="h-5 w-5 dark:text-gray-400 hover:dark:text-yellow-400"
						aria-hidden="true" />
				</span>
			</ListboxButton>

			<transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
				leave-to-class="opacity-0">
				<ListboxOptions
					class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md dark:bg-gray-900 border-1 border-gray-800 dark:border-grey-900 border-grey-800 py-1 pl-0 text-base shadow-lg ring-1 dark:ring-black ring-opacity-5 focus:outline-none sm:text-sm">
					<ListboxOption as="template" v-for="detail in allPlayerDetails" :key="detail.apiResponse.puuid"
						:value="detail" v-slot="{ active, selected }">
						<li
							:class="[active ? 'dark:bg-gray-800 dark:text-white' : 'dark:text-gray-200', 'relative cursor-default select-none py-2 pl-4 cursor-pointer']">
							<span class="flex items-center">
								<img :src="getSummonerIcon(getSummonerProfileIcon(detail))" alt="Summoner Icon"
									class="h-5 w-5 shrink-0 rounded-full" />
								<span
									:class="[selected ? 'font-semibold' : 'font-normal', 'ml-2 block truncate flex items-baseline']">
									{{ getSummonerName(detail) }}
									<span class="dark:text-gray-500 ml-1 text-xs">#{{ getSummonerTagLine(detail)
										}}</span>
								</span>
							</span>
						</li>
					</ListboxOption>
				</ListboxOptions>
			</transition>

		</div>
	</Listbox>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useStore } from 'vuex';
import { getUrlHelper } from '../globalSetup.js';
import ClientStatusTooltip from './reuse/ClientStatusTooltip.vue'; // Import the tooltip component
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';

const store = useStore();

const dropdownContainer = ref(null);
const dropdownOpen = ref(false);
const allPlayerDetails = computed(() => store.getters['summoner/getAllPlayerDetails']);
const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
const closeDropdownTimeout = ref(null);
const currentSelection = computed(() => store.getters['summoner/getCurrentSummoner']);

const clientConnected = computed(() => store.getters["client/clientConnected"]); // Access client connection status
const showTooltip = ref(false);

function toggleDropdown() {
	dropdownOpen.value = !dropdownOpen.value;
}


watch(currentSelection, (newSelection) => {
	console.log("Updated currentSelection:", newSelection);

	if (!store.getters['summoner/getCurrentSummoner'] && newSelection) {
		store.commit('summoner/setCurrentSummoner', newSelection);
	}
});

// Helper function to get summoner icon, fallback if missing
const getSummonerProfileIcon = (summonerDetail) => {
	return summonerDetail?.apiResponse?.profileIconId || 5541;
};

// Helper function to get summoner name from either API or WebSocket
const getSummonerName = (summonerDetail) => {
	return summonerDetail?.apiResponse?.gameName || 'Summoner';
};

// Helper function to get summoner tag line
const getSummonerTagLine = (summonerDetail) => {
	return summonerDetail?.apiResponse?.tagLine || '';
};


const getSummonerIcon = (iconId) => {
	const urlHelper = getUrlHelper();
	return urlHelper.getSummonerIconUrl(iconId);
};

function handleClickOutside(event) {
	if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
		dropdownOpen.value = false;
	}
}

function selectSummoner(summonerDetail) {
	store.commit('summoner/setCurrentSummoner', summonerDetail);
	dropdownOpen.value = false;
	console.log("Current Summoner Updated:", summonerDetail);
}


async function fetchSummonerData(summonerData) {
	if (!summonerData) return;

	try {
		// Dispatch a single action that handles both database checking and API fetching if needed
		await store.dispatch('summoner/fetchOrUpdateSummonerData', summonerData);
	} catch (error) {
		console.error("Error in fetchSummonerData:", error);
	}
}

// Listen for client connection status from the main process
window.api.receive("client-status", (status) => {
	if (status.connected) {
		console.log("League client connected, triggering summoner data fetch...");
		// Request summoner name from client
		window.api.send("get-summoner-name");
	}
});

// Listen for summoner name from main process
window.api.receive("summoner-name-response", (summonerData) => {
	if (summonerData && summonerData.gameName && summonerData.tagLine) {
		console.log("Summoner data received from client:", summonerData);
		// Trigger the check or fetch flow with summoner name and tag line
		fetchSummonerData(summonerData);
	} else {
		console.error("Invalid summoner data received from client");
	}
});

watch(isLoggedIn, (newVal, oldVal) => {
	if (newVal && !oldVal) {
		console.log("User logged in, waiting for summoner data from client...");
		// Optionally, reset currentSummoner or perform other tasks
	}
});

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
	if (closeDropdownTimeout.value) {
		clearTimeout(closeDropdownTimeout.value);
	}
	document.removeEventListener('click', handleClickOutside);
});
</script>


<style scoped></style>
