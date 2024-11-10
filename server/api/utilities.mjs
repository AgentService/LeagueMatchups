// api/utilities.mjs

import { RiotAPI, DDragon } from '@fightmegg/riot-api';
import express from "express";
import { getNamespaceLogger, logInfo, logError } from "../utils/logger.mjs";
const logger = getNamespaceLogger("api:utilities"); // Define namespace logger once

let rAPI;
let ddragon;

// Map platform ID (e.g., "euw1") to Riot API region (e.g., "europe")
export const getRegionByPlatformId = (platformId) => {
  const regionMap = {
    na1: "americas",
    la1: "americas",
    la2: "americas",
    br1: "americas",
    euw1: "europe",
    eun1: "europe",
    tr1: "europe",
    ru: "europe",
    kr: "asia",
    jp1: "asia",
    oc1: "sea",
    ph2: "sea",
    sg2: "sea",
    th2: "sea",
    tw2: "sea",
    vn2: "sea",
  };
  return regionMap[platformId] || "americas"; // Default to "americas" if not found
};

// Helper to map client region codes (e.g., "euw") to platform IDs (e.g., "euw1")
export const getRiotAPIPlatformByClientRegion = (clientRegion) => {
  if (!clientRegion) {
    logError(logger, "Client region is undefined or null.");
    return null;
  }

  const normalizedRegion = clientRegion.toLowerCase();
  const regionMap = {
    br: "br1",
    eune: "eun1",
    euw: "euw1",
    jp: "jp1",
    kr: "kr",
    lan: "la1",
    las: "la2",
    na: "na1",
    oce: "oc1",
    ph: "ph2",
    ru: "ru",
    sg: "sg2",
    th: "th2",
    tr: "tr1",
    tw: "tw2",
    vn: "vn2",
  };

  const platformId = regionMap[normalizedRegion];
  if (!platformId) {
    logError(logger, `Unrecognized client region: ${clientRegion}`);
    return null;
  }

  return platformId;
};

export const initializeRiotAPI = () => {
  if (!process.env.VITE_RIOT_API_KEY) {
    logError(logger, "VITE_RIOT_API_KEY is not set.");
    throw new Error("VITE_RIOT_API_KEY is not set.");
  }
  rAPI = new RiotAPI(process.env.VITE_RIOT_API_KEY);
  ddragon = new DDragon(rAPI);
};

export const getRiotAPI = () => {
  if (!rAPI) {
    logError(logger, "RiotAPI has not been initialized.");
    throw new Error("RiotAPI has not been initialized.");
  }
  return rAPI;
};

export const getDDragon = () => {
  if (!ddragon) {
    logError(logger, "DDragon has not been initialized.");
    throw new Error("DDragon has not been initialized.");
  }
  return ddragon;
};

export const getLatestVersion = async () => {
  try {
    if (!rAPI || !ddragon) {
      logError(logger, "RiotAPI client or ddragon has not been initialized.");
      return null;
    }
    logInfo(logger, "Fetching latest version");
    const latestVersion = await rAPI.ddragon.versions.latest();
    return latestVersion;
  } catch (error) {
    logError(logger, `Error fetching latest version: ${error.message}`);
    return null;
  }
};

export const snakeToCamelCase = (obj) => {
  const convertedObject = {};
  Object.keys(obj).forEach((key) => {
    const convertedKey = key.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
    convertedObject[convertedKey] = obj[key];
  });
  return convertedObject;
};

const router = express.Router();

router.get("/version", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion();
    if (!latestVersion) {
      res.status(500).send("Error fetching latest version");
    } else {
      res.json({ version: latestVersion });
    }
  } catch (error) {
    logError(logger, `Error in /version endpoint: ${error.message}`, req);
    res.status(500).send("Server error");
  }
});

export default router;