// api/matchups.mjs
import express from "express";
import { readJsonFile, writeJsonFile } from "../utils/fileOperations.mjs";
import { getLatestVersion } from "./utilities.mjs";
import Debug from "debug";

const debugApi = Debug("api");
const router = express.Router();


// Function to read matchups from JSON file
function readMatchups(userMatchupsFilePath) {
	console.log("userMatchupsFilePath:", userMatchupsFilePath);
	return readJsonFile(userMatchupsFilePath);
}

// Function to write matchups to JSON file
function writeMatchups(userMatchupsFilePath, matchups) {
	writeJsonFile(userMatchupsFilePath, matchups);
}

// Get all matchups
router.get("/", (req, res) => {
	debugApi("Fetching all matchups");
	const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;

	const matchups = readMatchups(userMatchupsFilePath);
	res.json(matchups);
});

router.get("/:id", async (req, res) => {
	debugApi("Fetching or creating specific matchups", req.params.id, req.query);
	debugApi("user:", req.user.email);
	const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;
	debugApi("userMatchupsFilePath:", userMatchupsFilePath);

	let matchups = readMatchups(userMatchupsFilePath);
	const [championAId, championBId] = req.params.id.split('-');

	let matchup = matchups.find(m => m.id === req.params.id);

	if (!matchup) {

		// Matchup not found - create a new one
		matchup = {
			id: req.params.id,
			champions: [
				{ id: championAId, name: championAId },
				{ id: championBId, name: championBId }
			],
			personalNotes: "",
			sharedNotes: null,
			lastUpdated: new Date().toISOString(), // Current timestamp
			gameVersion: await getLatestVersion() // Fetch or define the current game version
		};
		matchups.push(matchup);
		writeMatchups(userMatchupsFilePath, matchups);
		res.status(201).json(matchup); // 201 Created
	} else {
		// Matchup found
		res.json(matchup);
	}
});



// Create a new matchup
router.post("/", (req, res) => {
	debugApi("Create a new matchup");
	debugApi("user:", req.user.email);
	// Create the user-specific matchups file path
	const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;
	const matchups = readMatchups(userMatchupsFilePath);
	const newMatchup = req.body;
	matchups.push(newMatchup);
	writeMatchups(userMatchupsFilePath, matchups);
	res.status(201).json(newMatchup);
});

// Delete all matchups
router.delete("/delete", (req, res) => {
	debugApi("Delete all matchups");
	writeMatchups([]);
	res.status(204).send();
});

// Update a matchup's notes by id
router.patch("/:id/notes", (req, res) => {
	const { id } = req.params;
	const { personalNotes } = req.body;
	// Create the user-specific matchups file path
	const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;

	// Read matchups from the user's specific file
	const matchups = readJsonFile(userMatchupsFilePath);

	// Find the index of the matchup to update
	const matchupIndex = matchups.findIndex(m => m.id === id);
	if (matchupIndex !== -1) {
		// Update the matchup's notes
		matchups[matchupIndex].personalNotes = personalNotes;
		console.log("matchups note update:", matchups[matchupIndex]);
		// Write the updated matchups back to the user's specific file
		writeJsonFile(userMatchupsFilePath, matchups);

		res.json(matchups[matchupIndex]);
	} else {
		res.status(404).json({ error: "Matchup not found" });
	}
});

export default router;
