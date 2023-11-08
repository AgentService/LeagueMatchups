// store/index.js
import { createStore } from "vuex";
import { summoner } from "./modules/summoner.js";
import matchups from "./modules/matchups.js"; // Import the new matchups module
import { champions } from "./modules/champions.js";

export const store = createStore({
	modules: {
		summoner: summoner,
		champions: champions,
		matchups: matchups,
	},
	actions: {
	}
});
export default store; // Make sure this line is present
