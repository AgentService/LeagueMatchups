import express from "express";
import axios from "axios";
import Debug from "debug";
import { getRegionByPlatformId, getRiotAPIPlatformByClientRegion } from "./utilities.mjs";

const router = express.Router();
const debug = Debug("api");
router.get("/last-match/:puuid", async (req, res) => {
  const { puuid } = req.params;
  const clientRegion = req.query.region; // The shorthand region passed by the frontend (e.g., "euw")
  const count = req.query.count || 5;

  // Map client region to Riot API platform ID, then to the API region
  const platformId = getRiotAPIPlatformByClientRegion(clientRegion);
  const apiRegion = platformId ? getRegionByPlatformId(platformId) : null;

  if (!apiRegion) {
    return res.status(400).json({ message: "Invalid region specified." });
  }

  try {
    // Construct the request URL with the mapped region
    const matchListUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    console.log(`Fetching matches from URL: ${matchListUrl}`);

    const matchListResponse = await axios.get(matchListUrl, {
      headers: { "X-Riot-Token": process.env.VITE_RIOT_API_KEY },
    });

    const matchIds = matchListResponse.data;

    if (!matchIds.length) {
      return res.status(404).json({ message: "No matches found for this player." });
    }

    // Fetch match details for each match ID
    const matchesInfo = await Promise.all(
      matchIds.map(async (matchId) => {
        const matchDetailsUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
        try {
          const response = await axios.get(matchDetailsUrl, {
            headers: { "X-Riot-Token": process.env.VITE_RIOT_API_KEY },
          });
          return response.data;
        } catch (error) {
          console.error("Error fetching match details:", error);
          return null;
        }
      })
    );

    // Filter out any null responses from unsuccessful fetches
    const validMatchesInfo = matchesInfo.filter((info) => info !== null);

    res.json(validMatchesInfo);
  } catch (error) {
    console.error("Error fetching match data:", error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.status?.message || "An error occurred fetching match data.",
    });
  }
});

export default router;
