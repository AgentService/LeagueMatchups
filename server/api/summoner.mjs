// In api/summoner.js
import { RiotAPI, PlatformId } from '@fightmegg/riot-api';
import express from 'express';
import axios from 'axios';
import Debug from 'debug';
const debugApi = Debug('api');

const router = express.Router();
const RIOT_API_KEY = process.env.VITE_RIOT_API_KEY;
const rAPI = new RiotAPI(process.env.VITE_RIOT_API_KEY);

// Endpoint to get summoner by Riot ID
router.get('/by-riot-id', async (req, res) => {
  debugApi('Fetching summoner by Riot ID');
  const { region, gameName, tagLine } = req.query;
  const URL = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  try {
    const accountData = await axios.get(URL, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY
      }
    });

    const puuid = accountData.data.puuid;

    // Then, use the PUUID to get the summoner's data
    debugApi('Fetching summoner by PUUID');
    const summonerData = await rAPI.summoner.getByPUUID({
      region: PlatformId.EUW1,
      puuid: puuid,
    });
    // Send back the combined data as the response
    debugApi('Sending back combined data');
    res.json({
      accountData: accountData.data,
      summonerData: summonerData
    });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.status?.message || error.message;
    console.error('Error fetching summoner by Riot ID:', error);
    res.status(statusCode).json({ message });
  }
});

export default router;

