import express from "express";
import { RiotAPI, DDragon } from "@fightmegg/riot-api";
import Debug from "debug";
import { getLatestVersion } from "./utilities.mjs";
import { extractEmailFromToken } from "../utils/authMiddleware.mjs";
import { readJsonFile, writeJsonFile } from "../utils/fileOperations.mjs";
import schedule from "node-schedule"; // Make sure to install node-schedule package

const debugApi = Debug("api");
const router = express.Router();

const rAPI = new RiotAPI(process.env.VITE_RIOT_API_KEY);
const ddragon = new DDragon(rAPI);
let championListCache = { data: null, version: null };
let championDetailsCache = { data: null, version: null };

async function fetchChampionList(currentVersion) {
	try {
		debugApi("Fetching champion list");
		const listChampionsResponse = await ddragon.champion.all(currentVersion);
		return listChampionsResponse.data;
	} catch (error) {
		console.error("Error fetching champion list:", error);
		throw error;
	}
}

async function fetchAllChampionDetails(currentVersion) {
	let championsList = await fetchChampionList(currentVersion);
	const allChampionDetails = {};

	for (const championKey in championsList) {
		const championName = championsList[championKey].id;
		const detailedDataResponse = await ddragon.champion.byName({ championName: championName, version: currentVersion });
		allChampionDetails[championKey] = detailedDataResponse.data[championName];
	}
	return allChampionDetails;
}

async function initializeChampionDataCache() {
	const currentVersion = await getLatestVersion();
	if (currentVersion !== championListCache.version) {
		try {
			const championsList = await fetchChampionList(currentVersion);
			const allChampionDetails = await fetchAllChampionDetails(currentVersion);

			championListCache = { data: championsList, version: currentVersion };
			championDetailsCache = { data: allChampionDetails, version: currentVersion };
		} catch (error) {
			console.log("Error updating champion data cache:", error);
		}
	}
}

const getChampionTips = (req, res) => {
	const championId = req.params.championId;
	const filePath = `./api-data/champion_data/ChampionInfos.json`;
	console.log(filePath);

	try {
		const championData = readJsonFile(filePath);
		if (championData[championId]) {
			res.json({ championId, ...championData[championId] });
		} else {
			console.log("Champion tips not found");
			res.status(404).json({ error: "Champion tips not found" });
		}
	} catch (error) {
		console.error("Error reading JSON file:", error);
		res.status(500).json({ error: "Failed to read champion data file" });
	}
};

router.get("/:championId/custom-data", extractEmailFromToken, async (req, res) => {
	const championId = req.params.championId;
	console.log(championId);
	console.log(req.params);
	const userEmail = req.userEmail; // Extracted email from the token
	console.log(userEmail);

	const filePath = `./user_data/${userEmail}/champions_data.json`;
	console.log(filePath);
	try {
		const championsData = readJsonFile(filePath);
		// Check if the champion's custom data exists; if not, create a default entry
		if (!championsData[championId]) {
			championsData[championId] = {
				summonerSpells: [],
				notes: "",
				// ... other default properties
			};
			writeJsonFile(filePath, championsData);
		}
		res.json({
			championId: championId,
			data: championsData[championId]
		});
	} catch (error) {
		console.error("Error reading JSON file:", error);
		res.status(500).json({ error: "Failed to read champion data file" });
	}
});

// Endpoint to update custom data for a champion
router.post("/:championId/custom-data/summoner-spells", extractEmailFromToken,  async (req, res) => {
	const championId = req.params.championId;
	const customData = req.body; // Ensure you have body-parser middleware set up to parse JSON body
	const userEmail = req.userEmail; // Extracted email from the token
	const filePath = `./user_data/${userEmail}/champions_data.json`;

	try {
		const championsData = readJsonFile(filePath);
		if (!championsData[championId]) {
			championsData[championId] = { summonerSpells: [], personalNotes: "" };
		}

		// Update the champion's custom data
		championsData[championId].summonerSpells = customData;
		writeJsonFile(filePath, championsData);
		res.json({
			success: true,
			championId: championId,
			data: championsData[championId]
		});
	} catch (error) {
		console.error("Error updating JSON file:", error);
		res.status(500).json({ error: "Failed to update champion data file" });
	}
});

router.post("/:championId/custom-data/notes", extractEmailFromToken,  async (req, res) => {
	const championId = req.params.championId;
	const customData = req.body; // Ensure you have body-parser middleware set up to parse JSON body
	const userEmail = req.userEmail; // Extracted email from the token
	const filePath = `./user_data/${userEmail}/champions_data.json`;

	try {
		const championsData = readJsonFile(filePath);
		if (!championsData[championId]) {
			championsData[championId] = { summonerSpells: [], personalNotes: "" };
		}

		// Update the champion's custom data
		championsData[championId].personalNotes = customData.personalNotes;
		console.log(championsData[championId].personalNotes);
		console.log(championsData);
		writeJsonFile(filePath, championsData);
		res.json({
			success: true,
			championId: championId,
			data: championsData[championId]
		});
	} catch (error) {
		console.error("Error updating JSON file:", error);
		res.status(500).json({ error: "Failed to update champion data file" });
	}
});

router.get("/custom-data", extractEmailFromToken, async (req, res) => {
	const userEmail = req.userEmail; // Extracted email from the token
	const filePath = `./user_data/${userEmail}/champions_data.json`;

	try {
		const championData = readJsonFile(filePath);
		res.json(championData); // Return the entire file content
	} catch (error) {
		console.error("Error reading JSON file:", error);
		res.status(500).json({ error: "Failed to read champion data file" });
	}
});



// Schedule cache updates every two weeks on Wednesday
schedule.scheduleJob({ dayOfWeek: 3, hour: 0, minute: 0 }, initializeChampionDataCache);

router.get("/list", (req, res) => {
	res.json(championListCache);
});

router.get("/details", (req, res) => {
	res.json(championDetailsCache);
});

router.get("/:championId/tips", getChampionTips); // New endpoint for champion tips


// Initialize the cache on server startup
initializeChampionDataCache();

export default router;
