// In api/summoner.js
import { PlatformId } from "@fightmegg/riot-api";
import express from "express";
import axios from "axios";
import Debug from "debug";
const debugApi = Debug("api:summoner");
import { getRiotAPI } from "./utilities.mjs";
import { snakeToCamelCase } from "./utilities.mjs";

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
  debugApi("Fetching summoner by Riot ID");
  const { dbPool } = req.app.locals;
  const { region, gameName, tagLine } = req.query;
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

    let rows;

    if (existingSummoner.rows.length > 0) {
      // If the summoner already exists, use the existing rows
      rows = existingSummoner.rows.map((row) => snakeToCamelCase(row)); // Convert each existing row
    } else {
      // Insert a new record with the fetched data if not found
      const insertResult = await dbPool.query(
        "INSERT INTO SummonerDetails (Puuid, User_ID, Game_Name, Tag_Line, Summoner_ID, Account_ID, Profile_Icon_ID, Revision_Date, Summoner_Level, Timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
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
      // Use the rows from the insertion result
      rows = insertResult.rows.map((row) => snakeToCamelCase(row)); // Convert each inserted row
    }

    // Database integration ends here

    debugApi("Sending back combined data ", rows);
    res.json(rows);
  } catch (error) {
    console.error("Error in /by-riot-id route:", error);
    res.status(500).send("Internal Server Error");
  }
});

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
