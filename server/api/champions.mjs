import express from "express";
import { extractEmailFromToken } from "../utils/authMiddleware.mjs";
import { readJsonFile, writeJsonFile } from "../utils/fileOperations.mjs";
import schedule from "node-schedule"; // Make sure to install node-schedule package
import { getRiotAPI, getDDragon, getLatestVersion } from "./utilities.mjs";
import { readdir } from "fs/promises"; // Node.js filesystem module to read directory contents
import { join } from "path"; // To construct file paths
import { existsSync, mkdirSync } from "fs";
import { downloadChampionImages } from "../download.mjs";
import { getNamespaceLogger, logInfo, logError } from '../utils/logger.mjs'; // Import your logger

const logger = getNamespaceLogger("api:champions");
const router = express.Router();

let championListCache = { data: null, version: null };
let championDetailsCache = { data: null, version: null };
const championsFilePath = "./api-data/champions.json";
const championDetailsDirPath = "./api-data/champion_data";

export async function updateChampionData(currentVersion, dbPool) {
  let localVersionInfo;
  if (!currentVersion) {
    currentVersion = await getLatestVersion();
  }

  try {
    localVersionInfo = await readJsonFile(championsFilePath);
    logInfo(logger, `localVersionInfo: ${localVersionInfo.version}`);
  } catch (error) {
    logError(logger, "Error reading local champion version:", error);
    localVersionInfo = { version: null };
  }

  if (localVersionInfo.version !== currentVersion) {
    if (!existsSync(championDetailsDirPath)) {
      mkdirSync(championDetailsDirPath, { recursive: true });
    }

    const championsList = await fetchChampionList(currentVersion);

    const fileContent = {
      type: "champion",
      format: "standAloneComplex",
      version: currentVersion,
      data: championsList,
    };

    writeJsonFile(championsFilePath, fileContent);
    logInfo(logger, "champions.json updated successfully.");

    // Update the database with the new champions
    await updateChampionsDatabase(dbPool, championsList);

    const allChampionDetails = await fetchAllChampionDetails(currentVersion);
    for (const championName in allChampionDetails) {
      const filePath = `${championDetailsDirPath}/${championName}.json`;
      writeJsonFile(filePath, allChampionDetails[championName]);
    }

    for (const championDetails of Object.values(championsList)) {
      await downloadChampionImages(championDetails, championDetails.version);
    }
    logInfo(logger, "Champion data updated successfully.");
  } else {
    logInfo(logger, "Champion data is already up-to-date.");
  }
}


async function updateChampionsDatabase(dbPool, championsList) {
  // Fetch existing champion names from the database
  const existingChampions = await dbPool.query(`SELECT name FROM champions`);
  const existingChampionNames = existingChampions.rows.map(row => row.name);

  // Loop through each champion in the fetched list
  for (const championKey in championsList) {
    const champion = championsList[championKey];

    // If the champion doesn't already exist in the database, insert it
    if (!existingChampionNames.includes(champion.name)) {
      await dbPool.query(
        `INSERT INTO champions (key, name) VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING;`,
        [parseInt(champion.key), champion.name]
      );
      logInfo(logger, `Inserted new champion: ${champion.name}`);
    }
  }
}



async function fetchChampionList(currentVersion) {
  try {
    logInfo(logger, "Fetching champion list");
    const ddragon = getDDragon();
    const listChampionsResponse = await ddragon.champion.all(currentVersion);
    return listChampionsResponse.data;
  } catch (error) {
    logError(logger, "Error fetching champion list:", error);
    throw error;
  }
}

async function fetchAllChampionDetails(currentVersion) {
  let championsList = await fetchChampionList(currentVersion);
  const allChampionDetails = {};

  for (const championKey in championsList) {
    const championName = championsList[championKey].id;
    const ddragon = getDDragon();
    const detailedDataResponse = await ddragon.champion.byName({
      championName: championName,
      version: currentVersion,
    });
    allChampionDetails[championKey] = detailedDataResponse.data[championName];
  }
  return allChampionDetails;
}

async function loadChampionListCache(currentVersion) {
  try {
    const data = await readJsonFile(championsFilePath);
    championListCache = { data: data.data, version: currentVersion };
    logInfo(logger, "Champion List Cache loaded from file.");
  } catch (error) {
    logError(logger, "Error loading champion list cache:", error);
  }
}

function isNewVersionAvailable(currentVersion) {
  return (
    !championListCache.data ||
    championListCache.version !== currentVersion ||
    !championDetailsCache.data ||
    championDetailsCache.version !== currentVersion
  );
}

async function loadChampionDetailsCache(currentVersion) {
  try {
    const championFiles = await readdir(championDetailsDirPath);
    const allChampionDetails = {};

    for (const file of championFiles) {
      const championName = file.replace(".json", "");
      const filePath = join(championDetailsDirPath, file);
      // Safely read and parse the JSON file
      const detailedData = await readJsonFile(filePath);
      if (detailedData && typeof detailedData === "object") {
        // Assuming the structure is direct without needing to access a nested 'data'
        allChampionDetails[championName] = detailedData;
      } else {
        logError(logger, `Invalid data structure in ${filePath}`);
      }
    }

    championDetailsCache = {
      data: allChampionDetails,
      version: currentVersion,
    };
    logInfo(logger, "Champion Details Cache loaded from file.");
  } catch (error) {
    logError(logger, "Error loading champion details cache:", error);
    championDetailsCache = null; // Ensure global cache is null if loading fails
  }
}

export async function initializeChampionDataCache(dbPool) {
  const currentVersion = await getLatestVersion();
  logInfo(logger, "Updating champions database...");
  await updateChampionData(currentVersion, dbPool);
  logInfo(logger, "Champions database updated successfully.");

  // Load from local cache first
  await loadChampionListCache(currentVersion);
  await loadChampionDetailsCache(currentVersion);

  // Check if an update is needed after attempting to load from the cache
  if (isNewVersionAvailable(currentVersion)) {
    await updateChampionDataCache(currentVersion); // Make sure to pass currentVersion
  } else {
    logInfo(logger, "Champion caches are up-to-date. No update required.");
  }
}

// Update this function to ensure it checks the version before deciding to update the cache
async function updateChampionDataCache(currentVersion) {
  try {
    const championsList = await fetchChampionList(currentVersion);
    const allChampionDetails = await fetchAllChampionDetails(currentVersion);

    // Update the cache with new data
    championListCache = { data: championsList, version: currentVersion };
    championDetailsCache = {
      data: allChampionDetails,
      version: currentVersion,
    };
    logInfo(logger, `Champion caches updated to version: ${currentVersion}`);
  } catch (error) {
    logError(logger, "Error updating champion data caches:", error);
  }
}

const getChampionTips = (req, res) => {
  const championId = req.params.championId;  // Use championId directly
  const filePath = `./api-data/champion_tips.json`;

  try {
    const championData = readJsonFile(filePath);
    // Log the championId and available keys for debugging
    if (championData[championId]) {
      res.json({ championId, ...championData[championId] });
    } else {
      logInfo(logger, `No tips available for champion: ${championId}`, req);
      res.status(200).json({ message: "No tips available for this champion." });
    }
  } catch (error) {
    logError(logger, `Error reading JSON file: ${error.message}`, req);
    res.status(500).json({ error: "Failed to read champion data file" });
  }
};




// const getChampionTips = async (req, res) => {
//   const championName = req.params.championId; // Here, championId is actually the champion's name

//   try {
// 	const { dbPool } = req.app.locals;

//     const queryText = `
// 		SELECT ct.* FROM champion_tips AS ct
// 		JOIN champions AS c ON ct.champion_key = c.key
// 		WHERE c.name = $1;
// 	  `;
//     const result = await dbPool.query(queryText, [championName]);

// 	debug(result.rows[0])
//     if (result.rows.length > 0) {
//       const dbRow = result.rows[0];
//       const tipsData = {
//         championId: championName, // Using championName for clarity
//         championTips: {
//           identity: { short: dbRow.identity_short, long: dbRow.identity_long },
//           strengths: {
//             short: dbRow.strengths_short,
//             long: dbRow.strengths_long,
//           },
//           weaknesses: {
//             short: dbRow.weaknesses_short,
//             long: dbRow.weaknesses_long,
//           },
//           earlygame: {
//             short: dbRow.earlygame_short,
//             long: dbRow.earlygame_long,
//           },
//           midgame: { short: dbRow.midgame_short, long: dbRow.midgame_long },
//           lategame: { short: dbRow.lategame_short, long: dbRow.lategame_long },
//           teamfight: {
//             short: dbRow.teamfight_short,
//             long: dbRow.teamfight_long,
//           },
//           mindset: { short: dbRow.mindset_short, long: dbRow.mindset_long },
//           counter: { short: dbRow.counter_short, long: dbRow.counter_long },
//           insights: {
//             skillSynergy: dbRow.skillsynergy,
//             uniqueMechanics: dbRow.uniquemechanics,
//             situationalTips: dbRow.situational_tips,
//           },
//         },
//       };

//       res.json(tipsData);
//     } else {
//       debug("Champion tips not found for name:", championName);
//       res.status(404).json({ error: "Champion tips not found" });
//     }
//   } catch (error) {
//     console.error("Error querying the database:", error);
//     res.status(500).json({ error: "Failed to query the database" });
//   }
// };

router.get(
  "/:championId/custom-data",
  extractEmailFromToken,
  async (req, res) => {
    logInfo(logger, `Get Request for custom data for champion: ${req.params.championId}`, req);

    const championId = req.params.championId;
    const userEmail = req.userEmail; // Extracted email from the token

    const filePath = `./user_data/${userEmail}/champions_data.json`;
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
        data: championsData[championId],
      });
    } catch (error) {
      logError(logger, `Error reading JSON file: ${error.message}`, req);
      res.status(500).json({ error: "Failed to read champion data file" });
    }
  }
);

// Endpoint to update custom data for a champion
router.post(
  "/:championId/custom-data/summoner-spells",
  extractEmailFromToken,
  async (req, res) => {
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
        data: championsData[championId],
      });
    } catch (error) {
      logError(logger, `Error updating JSON file: ${error.message}`, req);
      res.status(500).json({ error: "Failed to update champion data file" });
    }
  }
);

router.post(
  "/:championId/custom-data/notes",
  extractEmailFromToken,
  async (req, res) => {
    logInfo(logger, `Post Request to update notes for champion: ${req.params.championId}`, req);
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
      logInfo(logger, `Notes updated for champion: ${championId}`, req);
      writeJsonFile(filePath, championsData);
      res.json({
        success: true,
        championId: championId,
        data: championsData[championId],
      });
    } catch (error) {
      logError(logger, `Error updating JSON file: ${error.message}`, req);
      res.status(500).json({ error: "Failed to update champion data file" });
    }
  }
);

router.get("/custom-data", extractEmailFromToken, async (req, res) => {
  const userEmail = req.userEmail; // Extracted email from the token
  const filePath = `./user_data/${userEmail}/champions_data.json`;

  try {
    const championData = readJsonFile(filePath);
    res.json(championData); // Return the entire file content
  } catch (error) {
    logError(logger, `Error reading JSON file: ${error.message}`, req);
    res.status(500).json({ error: "Failed to read champion data file" });
  }
});

// Schedule cache updates every two weeks on Wednesday
schedule.scheduleJob(
  { dayOfWeek: 3, hour: 0, minute: 0 },
  initializeChampionDataCache
);

router.get("/list", (req, res) => {
  res.json(championListCache);
});

router.get("/details", (req, res) => {
  res.json(championDetailsCache);
});

router.get("/:championId/tips", getChampionTips); // New endpoint for champion tips

// Initialize the cache on server startup

export default router;
