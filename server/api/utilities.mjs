import { RiotAPI, DDragon } from '@fightmegg/riot-api';
import express from "express";
import Debug from "debug";
const debug = Debug("app:utilities");
let rAPI;
let ddragon;

export const initializeRiotAPI = () => {
  if (!process.env.VITE_RIOT_API_KEY) {
    console.error("VITE_RIOT_API_KEY is not set.");
    throw new Error("VITE_RIOT_API_KEY is not set.");
  }
  rAPI = new RiotAPI(process.env.VITE_RIOT_API_KEY);
  ddragon = new DDragon(rAPI);
};

export const getRiotAPI = () => {
  if (!rAPI) {
    console.error("RiotAPI has not been initialized.");
    throw new Error("RiotAPI has not been initialized.");
  }
  return rAPI;
};

export const getDDragon = () => {
  if (!ddragon) {
    console.error("DDragon has not been initialized.");
    throw new Error("DDragon has not been initialized.");
  }
  return ddragon;
};

export const getLatestVersion = async () => {
  try {
    if (!rAPI || !ddragon) {
      console.error("RiotAPI client or ddragon has not been initialized.");
      return null;
    }
    debug("Fetching latest version");
    const latestVersion = await rAPI.ddragon.versions.latest();
    return latestVersion;
  } catch (error) {
    console.error("Error fetching latest version:", error);
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
}


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
    console.error("Error in /version endpoint:", error);
    res.status(500).send("Server error");
  }
});

export default router;
