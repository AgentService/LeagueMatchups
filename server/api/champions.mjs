// ./api/champions.mjs
import express from 'express';
import { RiotAPI, DDragon } from '@fightmegg/riot-api';
import Debug from 'debug';
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
    let listChampionsData = {};
    let detailedChampionsData = {};

    try {
        const version = await getLatestVersion();
        if (!version) {
            throw new Error('Failed to retrieve the latest version.');
        }
        debugApi(`Updating champion data for version ${version}`)
        listChampionsData = await ddragon.champion.all(version);
        // Assuming you still want detailed data per champion:
        for (const championKey in listChampionsData.data) {
            const championName = listChampionsData.data[championKey].id; // Use the champion ID as the name
            detailedChampionsData[championKey] = await ddragon.champion.byName({
                championName: championName, // Provide the championName parameter as required by the byName method
                version: version // Pass in the version if needed, otherwise it will fetch the latest
            });
        }

        debugApi('Champion data updated successfully.')
        // Return both sets of data
        return {
            list: listChampionsData.data,
            details: detailedChampionsData
        };

    } catch (error) {
        console.log('Error updating champion data:', error);
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


router.get('/', serveChampionData); // Handles GET /api/champions
router.get('/update', updateChampionData); // Handles GET /api/champions/update


export default router;
