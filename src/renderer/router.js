import { createRouter, createWebHashHistory } from "vue-router";
import store from "../store";

// Lazy-load the components to improve performance
const ChampionPage = () => import("./ChampionPage.vue");
const UserJourney = () => import("./UserJourney.vue");
const LoginPage = () => import("./components/LoginPage.vue");
const JournalPage = () => import("./JournalPage.vue");
const MatchupPage = () => import("./MatchupPage.vue");
const ReviewPage = () => import("./components/ReviewPage.vue");

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage, meta: { requiresAuth: false } },
  {
    path: "/ChampionPage",
    component: ChampionPage,
    meta: { requiresAuth: true, roles: ["admin", "member"] },
  },
  {
    path: "/MatchupPage",
    component: MatchupPage,
    meta: { requiresAuth: true, roles: ["admin", "member"] },
  },
  {
    path: "/userJourney",
    component: UserJourney,
    meta: { requiresAuth: true, roles: ["admin", "member"] },
  },
  {
    path: "/JournalPage",
    component: JournalPage,
    meta: { requiresAuth: true, roles: ["admin", "member"] },
  },
  {
    path: "/ReviewPage",
    name: "ReviewPage",
    component: ReviewPage,
    meta: { requiresAuth: true, roles: ["admin", "member"] },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles || []; // Get required roles from the route's meta
  const isLoggedIn = store.state.auth.isLoggedIn;
  const userRole = store.state.auth.role; // Assuming role is stored in auth state

  // Redirect to login if the route requires auth and the user is not logged in
  if (requiresAuth && !isLoggedIn) {
    return next("/login");
  }

  // Redirect logged-in users away from the login page
  if (isLoggedIn && to.path === "/login" && !requiredRoles.includes(userRole)) {
    return next("/ChampionPage");
  }

  // Role-based access control
  if (requiredRoles.length && !requiredRoles.includes(userRole)) {
    // Redirect to MatchupPage if user doesn't have required role for the route
    return next("/MatchupPage");
  }

  // Proceed as normal if all checks pass
  next();
});

export default router;
