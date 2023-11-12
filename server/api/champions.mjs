// ./api/champions.mjs
import express from 'express';
import { RiotAPI, DDragon } from '@fightmegg/riot-api';
import Debug from 'debug';
import { readJsonFile, writeJsonFile } from '../utils/fileOperations.mjs';

const debugApi = Debug('api');
const router = express.Router();

const rAPI = new RiotAPI(process.env.VITE_RIOT_API_KEY);
const ddragon = new DDragon();
const cacheDuration = 24 * 60 * 60; // 1 day in seconds
let championDataCache;
let isCacheBeingUpdated = false;

async function getLatestVersion() {
    try {
        debugApi('Fetching latest version');
        const versions = await rAPI.ddragon.versions.latest();
        return versions;
    } catch (error) {
        console.log('Error fetching latest version:', error);
        return null;
    }
}

async function updateChampionData() {
    let championsList = {};
    let championsDetails = {};

    try {
        const version = await getLatestVersion();
        if (!version) {
            throw new Error('Failed to retrieve the latest version.');
        }
        debugApi(`Updating champion data for version ${version}`);
        const listChampionsResponse = await ddragon.champion.all(version);

        // Store the basic data
        championsList = listChampionsResponse.data;

        // Fetch and store detailed data for each champion
        for (const championKey in championsList) {
            const championName = championsList[championKey].id;
            const detailedDataResponse = await ddragon.champion.byName({
                championName: championName,
                version: version
            });
            // Assuming detailedDataResponse.data contains the details
            championsDetails[championKey] = detailedDataResponse.data[championName];
        }

        debugApi('Champion data updated successfully.');
        // debugApi('Champion data:', championsList['Aatrox'], championsDetails['Aatrox']);
        // Return the structured data
        const result = {
            data: {
                list: championsList,
                details: championsDetails
            },
            timestamp: Date.now(),
            version: version
        };
        return result;

    } catch (error) {
        console.error('Error updating champion data:', error);
        return null;
    }
}


// Initialize the cache on startup
debugApi('Initializing champion data cache on startup.');
initializeChampionDataCache();

// Periodically update cache
debugApi(`Updating champion data cache every ${cacheDuration} seconds.`);
setInterval(initializeChampionDataCache, cacheDuration * 1000);

async function initializeChampionDataCache() {
    if (!isCacheBeingUpdated) {
        debugApi('Updating champion data cache...');
        isCacheBeingUpdated = true;
        try {
            const data = await updateChampionData();
            if (data) {
                championDataCache = data;
                debugApi('Champion data cache updated successfully.');
            }
        } catch (error) {
            console.log('Error updating champion data cache:', error);
        }
        isCacheBeingUpdated = false;
    }
}

const serveChampionData = async (req, res) => {
    debugApi('Serving champion data...');
    if (!championDataCache) {
        try {
            debugApi('Champion data cache is empty, fetching from server...');
            championDataCache = await updateChampionData();
            debugApi('Champion data cache updated successfully.');
        } catch (error) {
            console.log('Error fetching champion data:', error);
            res.status(500).json({ error: 'Failed to fetch champion data' });
            return;
        }
    }
    res.set('Cache-Control', `public, max-age=${cacheDuration}`);
    debugApi('Serving champion data from cache.');
    res.json(championDataCache);
};

const getChampionInfo = (req, res) => {
    const championId = req.params.championId;
    console.log('championId:', championId);
    const filePath = './api-data/champion_data/ChampionInfos.json';
    console.log(filePath);
  
    try {
      const championData = readJsonFile(filePath);
  
      // Check if the requested champion exists in the data
      if (championData[championId]) {
        // Send the champion info as JSON response
        res.json(championData[championId]);
      } else {
        // If the champion is not found, respond with an error
        res.status(404).json({ error: 'Champion not found' });
      }
    } catch (error) {
      // Handle file read or JSON parsing errors
      console.error('Error reading JSON file:', error);
      res.status(500).json({ error: 'Failed to read champion data file' });
    }
  };



router.get('/', serveChampionData); // Handles GET /api/champions
router.get('/update', updateChampionData); // Handles GET /api/champions/update
router.get('/:championId', getChampionInfo);


export default router;