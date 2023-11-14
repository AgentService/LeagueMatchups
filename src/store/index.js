// store/index.js
import { createStore } from "vuex";
import { summoner } from "./modules/summoner.js";
import matchups from "./modules/matchups.js"; // Import the new matchups module
import { champions } from "./modules/champions.js";
import { auth }	from "./modules/auth.js";

export const store = createStore({
	modules: {
		summoner: summoner,
		champions: champions,
		matchups: matchups,
		auth: auth,
	},
	actions: {
	}
});
export default store; // Make sure this line is present
