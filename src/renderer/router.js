import { createRouter, createWebHashHistory } from "vue-router";
import store from "../store";
// // Lazy load the components
// const ChampionMatchup = () => import('./ChampionPage.vue');
// const UserJourney = () => import('./UserJourney.vue');
// //... other lazy-loaded imports

import ChampionPage from "./ChampionPage.vue";
import UserJourney from "./UserJourney.vue";
import LoginPage from "./components/LoginPage.vue";
import JournalPage from "./JournalPage.vue";
//... other imports

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage, meta: { requiresAuth: false } },
  {
    path: "/ChampionPage",
    component: ChampionPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/userJourney",
    component: UserJourney,
    meta: { requiresAuth: true },
  },
  {
    path: "/JournalPage",
    component: JournalPage,
    meta: { requiresAuth: true },
  },
  // Other routes...
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isLoggedIn = store.state.auth.isLoggedIn;

  if (requiresAuth && !isLoggedIn) {
    // Redirect users to the login page if the route requires authentication and they're not logged in
    next("/login");
  } else if (isLoggedIn && to.path === "/login") {
    // Redirect logged-in users away from the login page (to championMatchup, for example)
    next("/ChampionPage");
  } else {
    // Proceed as normal for all other cases
    next();
  }
});

export default router;
