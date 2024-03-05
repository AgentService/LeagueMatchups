import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
// // Lazy load the components
// const ChampionMatchup = () => import('./ChampionPage.vue');
// const UserJourney = () => import('./UserJourney.vue');
// //... other lazy-loaded imports

import ChampionMatchup from "./ChampionPage.vue";
import UserJourney from "./UserJourney.vue";
import LoginPage from "./components/LoginPage.vue";
//... other imports

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage, meta: { requiresAuth: false } },
  {
    path: "/championMatchup",
    component: ChampionMatchup,
    meta: { requiresAuth: true },
  },
  {
    path: "/userJourney",
    component: UserJourney,
    meta: { requiresAuth: true },
  },
  // Other routes...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isLoggedIn = store.state.auth.isLoggedIn;

  // Only proceed to check the League directory if the user is already logged in.
  // This check could be adjusted based on your application's structure.
  const leagueDirExists = isLoggedIn
    ? await window.api.checkLeagueClientPathExists()
    : false;

  if (requiresAuth && !isLoggedIn) {
    next("/login");
  } else if (isLoggedIn && !leagueDirExists && to.path !== "/login") {
    // Allow logged-in users without a directory set to access the login page for setup.
    next("/login");
  } else if (isLoggedIn && to.path === "/login" && leagueDirExists) {
    // Redirect to championMatchup if logged in and directory is set.
    next("/championMatchup");
  } else {
    next(); // Proceed as normal
  }
});
export default router;
