import express from "express";
import axios from "axios";
import { getRegionByPlatformId, getRiotAPIPlatformByClientRegion } from "./utilities.mjs";
import { verifyToken } from "../utils/authMiddleware.mjs";
import { getNamespaceLogger, logInfo, logError } from '../utils/logger.mjs'; // Import your logger

const logger = getNamespaceLogger("api:matches");
const router = express.Router();

router.get("/last-match/:puuid", verifyToken, async (req, res) => {
  const { puuid } = req.params;
  const clientRegion = req.query.region;
  const initialCount = parseInt(req.query.count) || 5;
  const desiredRankedMatches = initialCount;

  const platformId = getRiotAPIPlatformByClientRegion(clientRegion);
  const apiRegion = platformId ? getRegionByPlatformId(platformId) : null;

  if (!apiRegion) {
    return res.status(400).json({ message: "Invalid region specified." });
  }

  let rankedMatches = [];
  let start = 0;

  try {
    while (rankedMatches.length < desiredRankedMatches) {
      const matchListUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${initialCount}&queue=420`;
      logInfo(logger, `Fetching matches from URL: ${matchListUrl}`, req);

      const matchListResponse = await axios.get(matchListUrl, {
        headers: { "X-Riot-Token": process.env.VITE_RIOT_API_KEY },
      });

      const matchIds = matchListResponse.data;

      if (!matchIds.length) {
        break;
      }

      const matchesInfo = await Promise.all(
        matchIds.map(async (matchId) => {
          const matchDetailsUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
          logInfo(logger, `Fetching match details from URL: ${matchDetailsUrl}`, req);
          try {
            const response = await axios.get(matchDetailsUrl, {
              headers: { "X-Riot-Token": process.env.VITE_RIOT_API_KEY },
            });
            return response.data;
          } catch (error) {
            logError(logger, `Error fetching match details: ${error.message}`, req, error);
            return null;
          }
        })
      );

      rankedMatches = rankedMatches.concat(matchesInfo.filter((info) => info !== null));
      start += initialCount;
    }

    res.json(rankedMatches.slice(0, desiredRankedMatches));
  } catch (error) {
    logError(logger, `Error fetching match data: ${error.message}`, req, error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.status?.message || "An error occurred fetching match data.",
    });
  }
});

router.get("/match-details/:gameId", verifyToken, async (req, res) => {
  let { gameId } = req.params;
  const { puuid, region } = req.query;

  const platformId = getRiotAPIPlatformByClientRegion(region);
  const apiRegion = platformId ? getRegionByPlatformId(platformId) : null;

  if (!apiRegion || !gameId || !puuid) {
    return res.status(400).json({ message: "Invalid request parameters." });
  }

  gameId = `${platformId.toUpperCase()}_${gameId}`;

  try {
    const matchDetailsUrl = `https://${apiRegion}.api.riotgames.com/lol/match/v5/matches/${gameId}`;
    logInfo(logger, `Fetching match details from URL: ${matchDetailsUrl}`, req);

    const response = await axios.get(matchDetailsUrl, {
      headers: { "X-Riot-Token": process.env.VITE_RIOT_API_KEY },
    });

    res.json(response.data);
  } catch (error) {
    logError(logger, `Error fetching match details: ${error.message}`, req, error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.status?.message || "Error fetching match details.",
    });
  }
});

export default router;
