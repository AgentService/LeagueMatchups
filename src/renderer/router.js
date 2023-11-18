import { createRouter, createWebHistory } from 'vue-router';
import ChampionMatchup from './ChampionPage.vue';
import UserJourney from './UserJourney.vue';
//... other imports

const routes = [
  { path: '/championMatchup', component: ChampionMatchup },
  { path: '/userJourney', component: UserJourney },
  //... other routes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
