// In api/summoner.js
import { PlatformId } from "@fightmegg/riot-api";
import express from "express";
import axios from "axios";
import Debug from "debug";
const debug = Debug("api:summoner");
import { getRiotAPI } from "./utilities.mjs";
import { snakeToCamelCase } from "./utilities.mjs";
import { getRiotAPIPlatformByClientRegion, getRegionByPlatformId } from "./utilities.mjs";

const router = express.Router();

router.get("/data", async (req, res) => {
  const userId = req.user.id;
  try {
    const summonerData = await getSummonerDataByAccountId(userId, req);
    const convertedData = summonerData.map((row) => snakeToCamelCase(row)); // Convert each row
    res.json(convertedData);
  } catch (error) {
    console.error("Failed to fetch summoner data:", error);
    res.status(500).send("Internal Server Error");
  }
});

const getSummonerDataByAccountId = async (userId, req) => {
  const { dbPool } = req.app.locals;

  const queryText = `
      SELECT Puuid, Game_Name, Tag_Line, Summoner_ID, Account_ID, Profile_Icon_ID, Revision_Date, Summoner_Level, Timestamp
      FROM SummonerDetails
      WHERE User_ID = $1;
  `;
  try {
    const { rows } = await dbPool.query(queryText, [userId]);
    return rows; // This will return an array of summoner details
  } catch (err) {
    console.error("Error querying SummonerDetails:", err);
    throw err; // Re-throw the error and handle it in the calling function
  }
};

router.get("/by-riot-id", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { region, gameName, tagLine } = req.query;
  const userId = req.user.id;

  try {
    debug("Fetching summoner data for:", gameName, tagLine);

    // Convert the general region (e.g., "EU" or "NA") to the specific platform ID (e.g., "euw1", "na1")
    const platformId = getRiotAPIPlatformByClientRegion(region);

    if (!platformId) {
      return res.status(400).json({ message: "Invalid or unsupported region specified." });
    }

    // Convert the platform ID to the Riot API's general region (e.g., "euw1" to "europe")
    const riotRegion = getRegionByPlatformId(platformId);

    // Step 1: Fetch account data using the Riot API's general region format
    const accountUrl = `https://${riotRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const accountData = await axios.get(accountUrl, {
      headers: {
        "X-Riot-Token": process.env.VITE_RIOT_API_KEY,
      },
    });

    const puuid = accountData.data.puuid;
    debug("Account data fetched from Riot API:", accountData.data);

    // Step 2: Fetch summoner data by PUUID using the specific platform ID
    const rAPI = getRiotAPI();
    const summonerData = await rAPI.summoner.getByPUUID({
      region: platformId,
      puuid: puuid,
    });

    debug("Summoner data fetched from Riot API:", summonerData);

    // Step 3: Check if the summoner already exists for this user in the database
    const existingSummoner = await dbPool.query(
      "SELECT * FROM SummonerDetails WHERE Puuid = $1 AND User_ID = $2",
      [puuid, userId]
    );

    if (existingSummoner.rows.length > 0) {
      // Summoner exists; check if an update is needed
      const existingData = existingSummoner.rows[0];
      const { needsUpdate, updateReasons } = checkIfUpdateNeeded(existingData, summonerData);

      if (needsUpdate) {
        debug("Updating summoner data for reasons:", updateReasons.join(", "));

        await dbPool.query(
          `UPDATE SummonerDetails 
           SET Summoner_Level = $2, Profile_Icon_ID = $3, Revision_Date = $4, Timestamp = $5
           WHERE Puuid = $1 AND User_ID = $6`,
          [
            puuid,
            summonerData.summonerLevel,
            summonerData.profileIconId,
            summonerData.revisionDate,
            Date.now(),
            userId
          ]
        );

        debug("Updated summoner data in the database.");
      } else {
        debug("No update necessary for summoner data.");
      }

      res.json(existingSummoner.rows.map(row => snakeToCamelCase(row)));
    } else {
      // Summoner does not exist for this user, so insert new data
      const insertResult = await dbPool.query(
        `INSERT INTO SummonerDetails (Puuid, User_ID, Game_Name, Tag_Line, Summoner_ID, Account_ID, Profile_Icon_ID, Revision_Date, Summoner_Level, Timestamp) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
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

      res.json(insertResult.rows.map((row) => snakeToCamelCase(row)));
      debug("Inserted new summoner data for user.");
    }

  } catch (error) {
    console.error("Error in /by-riot-id route:", error);
    res.status(500).send("Internal Server Error");
  }
});


/**
 * Helper function to determine if an update is needed based on changes in summoner data.
 * Compares stored summoner data in the database with the latest data from Riot API.
 *
 * @param {Object} existingData - Current summoner data from the database.
 * @param {Object} newData - Latest summoner data from Riot API.
 * @returns {Object} Object containing `needsUpdate` boolean and an array of `updateReasons`.
 */
function checkIfUpdateNeeded(existingData, newData) {
  let needsUpdate = false;
  const updateReasons = [];

  if (Number(existingData.revision_date) !== Number(newData.revisionDate)) {
    updateReasons.push(`Revision date changed from ${existingData.revision_date} to ${newData.revisionDate}`);
    needsUpdate = true;
  }

  if (Number(existingData.summoner_level) !== Number(newData.summonerLevel)) {
    updateReasons.push(`Summoner level changed from ${existingData.summoner_level} to ${newData.summonerLevel}`);
    needsUpdate = true;
  }

  if (Number(existingData.profile_icon_id) !== Number(newData.profileIconId)) {
    updateReasons.push(`Profile icon ID changed from ${existingData.profile_icon_id} to ${newData.profileIconId}`);
    needsUpdate = true;
  }

  return { needsUpdate, updateReasons };
}




router.post("/update-summoner-details", async (req, res) => {
  const { puuid, summonerLevel, profileIconId } = req.body;

  try {
    // Perform the update operation here
    const updatedDetails = await dbPool.query(
      `
          UPDATE SummonerDetails 
          SET SummonerLevel = $2, Profile_Icon_ID = $3
          WHERE Puuid = $1`,
      [puuid, summonerLevel, profileIconId]
    );
    const convertedDetails = updatedDetails.rows.map((row) =>
      snakeToCamelCase(row)
    ); // Convert each updated row

    res.status(200).json({ message: "Summoner details updated successfully.", details: convertedDetails[0] });
  } catch (error) {
    console.error("Error updating summoner details:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
