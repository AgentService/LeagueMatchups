// In api/summoner.js
import { PlatformId } from "@fightmegg/riot-api";
import express from "express";
import axios from "axios";
import Debug from "debug";
const debugApi = Debug("api:summoner");
import { getRiotAPI } from "./utilities.mjs";
import debug from "debug";

const router = express.Router();

router.get("/by-riot-id", async (req, res) => {
  debugApi("Fetching summoner by Riot ID");
  const { dbPool } = req.app.locals;
  const query = req.query;
  const { region, gameName, tagLine } = query;
  const userId = req.user.id;

  try {
    const URL = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    const accountData = await axios.get(URL, {
      headers: {
        "X-Riot-Token": process.env.VITE_RIOT_API_KEY,
      },
    });

    const puuid = accountData.data.puuid;

    debugApi("Fetching summoner by PUUID");
    const rAPI = getRiotAPI();
    const summonerData = await rAPI.summoner.getByPUUID({
      region: PlatformId.EUW1,
      puuid: puuid,
    });

    // Database integration starts here
    // Check if the summoner already exists in the database
    const existingSummoner = await dbPool.query(
      "SELECT * FROM SummonerDetails WHERE Puuid = $1",
      [puuid]
    );
    if (!existingSummoner.rows.length > 0) {
      // Insert a new record with the fetched data if not found
      await dbPool.query(
        "INSERT INTO SummonerDetails (Puuid, UserID, GameName, TagLine, SummonerID, AccountID, ProfileIconID, RevisionDate, SummonerLevel, Timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [
          puuid,
          userId,
          gameName,
          tagLine,
          summonerData.id,
          summonerData.accountId,
          summonerData.profileIconId,
          summonerData.revisionDate,
          summonerData.summonerLevel,
          Date.now(),
        ]
      );
    }
    // Database integration ends here

    debugApi("Sending back combined data");
    res.json({
      accountData: accountData.data,
      summonerData: summonerData,
    });
  } catch (error) {
    console.error("Error in /by-riot-id route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update-summoner-details", async (req, res) => {
  const { puuid, summonerLevel, profileIconId } = req.body;

  try {
    // Perform the update operation here
    await dbPool.query(
      `
          UPDATE SummonerDetails 
          SET SummonerLevel = $2, ProfileIconID = $3
          WHERE Puuid = $1`,
      [puuid, summonerLevel, profileIconId]
    );

    res.status(200).json({ message: "Summoner details updated successfully." });
  } catch (error) {
    console.error("Error updating summoner details:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
