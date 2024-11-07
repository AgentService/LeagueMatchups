import express from "express";
import axios from "axios";
import Debug from "debug";
import { getRegionByPlatformId, getRiotAPIPlatformByClientRegion } from "./utilities.mjs";

const router = express.Router();
const debug = Debug("api");
router.get("/last-match/:puuid", async (req, res) => {
  const { puuid } = req.params;
  const clientRegion = req.query.region;
  const initialCount = parseInt(req.query.count) || 5;
  const desiredRankedMatches = initialCount;  // Target number of ranked matches to return
  const rankedQueueIds = [420, 440];

  const platformId = getRiotAPIPlatformByClientRegion(clientRegion);
  const apiRegion = platformId ? getRegionByPlatformId(platformId) : null;

  if (!apiRegion) {
    return res.status(400).json({ message: "Invalid region specified." });
  }

  let rankedMatches = [];
  let start = 0;

  try {
    while (rankedMatches.length < desiredRankedMatches) {
      const matchListUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${initialCount}`;
      debug(`Fetching matches from URL: ${matchListUrl}`);

      const matchListResponse = await axios.get(matchListUrl, {
        headers: { "X-Riot-Token": process.env.VITE_RIOT_API_KEY },
      });

      const matchIds = matchListResponse.data;

      if (!matchIds.length) {
        // If there are no more matches to fetch, break out of the loop
        break;
      }

      // Fetch match details for each match ID and filter for ranked matches
      const matchesInfo = await Promise.all(
        matchIds.map(async (matchId) => {
          const matchDetailsUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
          try {
            const response = await axios.get(matchDetailsUrl, {
              headers: { "X-Riot-Token": process.env.VITE_RIOT_API_KEY },
            });
            const matchData = response.data;
            // Only return data for ranked matches
            return rankedQueueIds.includes(matchData.info.queueId) ? matchData : null;
          } catch (error) {
            debug("Error fetching match details:", error);
            return null;
          }
        })
      );

      // Filter out non-ranked matches and unsuccessful fetches
      rankedMatches = rankedMatches.concat(matchesInfo.filter((info) => info !== null));

      // Increase the starting point for the next batch
      start += initialCount;
    }

    // Return only the desired number of ranked matches
    res.json(rankedMatches.slice(0, desiredRankedMatches));
  } catch (error) {
    debug("Error fetching match data:", error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.status?.message || "An error occurred fetching match data.",
    });
  }
});

export default router;
