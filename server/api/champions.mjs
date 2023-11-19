import express from "express";
import { RiotAPI, DDragon } from "@fightmegg/riot-api";
import Debug from "debug";
import { getLatestVersion } from "./utilities.mjs";
import { readJsonFile } from "../utils/fileOperations.mjs";
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
	const filePath = "./api-data/champion_data/ChampionInfos.json";

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
