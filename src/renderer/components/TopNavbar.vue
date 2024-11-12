<template>
	<div
		class="absolute top-0 left-0 right-0 text-sm z-50 border-b border-b-gray-800 dark:bg-gray-900 bg-gray-900 shadow-md dark:shadow-none">
		<div class="w-5/6 mx-auto flex justify-between items-center h-12 px-2 relative">
			<!-- Summoner Info (Left Section) with flex-grow -->
			<div class="relative flex items-center space-x-4 flex-grow">
				<div
					class="relative cursor-help flex items-center rounded-full p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
					@mouseover="showTooltip = true" @mouseleave="showTooltip = false">
					<!-- Colored Dot with Outline -->
					<span
						:class="[clientConnected ? 'bg-green-700 border-green-400' : 'bg-red-500 border-red-500', 'h-4 w-4 rounded-full inline-block border-2']"
						aria-hidden="true">
					</span>
					<span v-if="clientConnected" class="ml-2 text-green-500"></span>
					<span v-else class="ml-2 text-red-500"></span>
				</div>

				<div v-if="showTooltip" class="absolute top-full">
					<ClientStatusTooltip :clientConnected="clientConnected" :visible="showTooltip"
						connectedMessage="League Client connected" disconnectedMessage="League Client not connected" />
				</div>

				<!-- Divider -->
				<div class="border-l border-gray-700 h-8"></div>

				<!-- Summoner Info Component -->
				<SummonerInfo />
			</div>

			<!-- Center Navigation Links with absolute positioning -->
			<div class="absolute left-1/2 transform -translate-x-1/2 flex space-x-8">
				<router-link v-if="canAccessAdvancedTabs" to="/ChampionPage"
					class="uppercase font-semibold dark:text-gray-300 hover:dark:text-gold-1"
					active-class="link-active">
					Overview
				</router-link>
				<router-link to="/MatchupPage" class="uppercase font-semibold dark:text-gray-300 hover:dark:text-gold-1"
					active-class="link-active">
					Matchup
				</router-link>
				<router-link v-if="canAccessAdvancedTabs" to="/JournalPage"
					class="uppercase font-semibold dark:text-gray-300 hover:dark:text-gold-1"
					active-class="link-active">
					Journal
				</router-link>
			</div>

			<!-- Client Status and Profile Dropdown (Right Section) with flex-shrink-0 -->
			<div class="flex items-center space-x-4 flex-shrink-0">
				<Menu as="div" class="relative inline-block text-left">
					<div>
						<MenuButton
							class="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md px-3 py-2 shadow-sm ring-1 ring-gray-500 bg-gray-900 hover:bg-gray-700 dark:ring-gray-600 dark:hover:bg-gray-700 transition-all">
							<UserCircleIcon class="h-5 w-5 dark:text-gold-1 text-gold-1" aria-hidden="true" />
							<span class="dark:text-gold-1 hover:dark:text-gold-1 text-gold-1">{{ user.username }}</span>
						</MenuButton>
					</div>
					<transition enter-active-class="transition ease-out duration-100"
						enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
						leave-active-class="transition ease-in duration-75"
						leave-from-class="transform opacity-100 scale-100"
						leave-to-class="transform opacity-0 scale-95">
						<MenuItems
							class="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-md shadow-lg border-1 border-gray-800 focus:outline-none bg-gray-900 text-gray-300">
							<div class="py-1">
								<MenuItem v-slot="{ active }">
								<button
									:class="[active ? 'bg-gray-800 text-gold-1' : 'text-gray-300', 'group flex items-center w-full px-4 py-2 text-left text-sm transition-all rounded-md']">
									<ChatBubbleOvalLeftEllipsisIcon class="mr-3 h-5 w-5" aria-hidden="true" />
									Feedback
								</button>
								</MenuItem>
							</div>
							<div class="py-1">
								<MenuItem v-slot="{ active }">
								<button @click="logout" type="button"
									:class="[active ? 'bg-gray-800 text-gold-1' : 'text-gray-300', 'group flex items-center w-full px-4 py-2 text-left text-sm transition-all rounded-md']">
									<ArrowLeftOnRectangleIcon class="mr-3 h-5 w-5" aria-hidden="true" />
									Log Out
								</button>
								</MenuItem>
							</div>
						</MenuItems>
					</transition>
				</Menu>
			</div>
		</div>
	</div>
</template>


<script setup>
import toggleDarkMode from '../utils/darkmode.js';
import SummonerInfo from './SummonerInfo.vue';
import ClientStatusTooltip from './reuse/ClientStatusTooltip.vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/vue/24/solid';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { BellIcon, MoonIcon, ChatBubbleOvalLeftEllipsisIcon, ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/solid';
import { LinkIcon } from '@heroicons/vue/16/solid'

import { ref, computed } from 'vue';
import { useStore } from 'vuex';


const showTooltip = ref(false);

const store = useStore();
const clientConnected = computed(() => store.getters['client/clientConnected']);
const user = computed(() => store.state.auth.user);
const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
const canAccessAdvancedTabs = computed(() => {
	const userRole = store.state.auth.role;
	return userRole === 'admin' || userRole === 'member';
});

const logout = () => store.dispatch('auth/logout');
</script>

<style scoped>
.background-custom {
	background-color: var(--hextech-black-2);
}

.router-link-active.text-gold-1 {
	color: var(--gold-1) !important;
}

.link-active {
	position: relative;
	color: var(--gold-1);
}

.link-active::after {
	content: "";
	position: absolute;
	bottom: -4px;
	left: 0;
	width: 125%;
	height: 2px;
	background-color: var(--gold-4);
	transform: translateX(-10%);
}
</style>