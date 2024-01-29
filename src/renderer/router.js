import { createRouter, createWebHistory } from 'vue-router';

// Lazy load the components
const ChampionMatchup = () => import('./ChampionPage.vue');
const UserJourney = () => import('./UserJourney.vue');
//... other lazy-loaded imports

const routes = [
	{ path: '/championMatchup', component: ChampionMatchup },
	{ path: '/userJourney', component: UserJourney },
	//... other routes with lazy-loaded components
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
