import express from "express";
import { snakeToCamelCase } from "./utilities.mjs";
import { updateChampionData } from "./champions.mjs"; // Import from champions.js
import { getNamespaceLogger, logInfo, logError } from "../utils/logger.mjs";

const logger = getNamespaceLogger("api:matchups");
const router = express.Router();

// Fetch or create a specific matchup by ID
router.get("/:id", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.id;
  const [championAName, championBName] = combinedId.split("-");

  try {
    // Ensure both champions exist in the database
    let championsCheck = await dbPool.query(
      `SELECT name FROM champions WHERE name = ANY($1::text[])`,
      [[championAName, championBName]]
    );

    if (championsCheck.rows.length !== 2) {
      // Trigger a data update if either champion doesn't exist
      logInfo(logger, `Champion(s) missing, updating champion data`, req);
      await updateChampionData(null, dbPool);

      // Recheck after update
      championsCheck = await dbPool.query(
        `SELECT name FROM champions WHERE name = ANY($1::text[])`,
        [[championAName, championBName]]
      );

      if (championsCheck.rows.length !== 2) {
        logError(logger, "Invalid champion names provided", req);
        return res.status(400).json({ error: "Invalid champion names." });
      }
    }

    // Check for an existing matchup in the database
    let matchup = await dbPool.query(
      `SELECT * FROM matchups WHERE combined_id = $1`,
      [combinedId]
    );

    if (matchup.rows.length === 0) {
      // No matchup found, create a new one
      logInfo(logger, `Creating a new matchup with ID: ${combinedId}`, req);
      matchup = await dbPool.query(
        `INSERT INTO matchups (champion_a_name, champion_b_name, combined_id) 
         VALUES ($1, $2, $3) RETURNING *;`,
        [championAName, championBName, combinedId]
      );
      const createdMatchup = snakeToCamelCase(matchup.rows[0]);
      res.status(201).json(createdMatchup);
    } else {
      // Matchup found, return it
      const foundMatchup = snakeToCamelCase(matchup.rows[0]);
      res.json(foundMatchup);
    }
  } catch (error) {
    logError(logger, "Error accessing database", req, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
