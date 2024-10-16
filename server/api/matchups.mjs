// api/matchups.mjs
import express from "express";
// import { readJsonFile, writeJsonFile } from "../utils/fileOperations.mjs";
// import { getLatestVersion } from "./utilities.mjs";
import Debug from "debug";
import { snakeToCamelCase } from "./utilities.mjs";
import { updateChampionData, initializeChampionDataCache } from "./champions.mjs"; // Import from champions.js

const debug = Debug("api:matchups");
const router = express.Router();

// // Function to read matchups from JSON file
// function readMatchups(userMatchupsFilePath) {
//   return readJsonFile(userMatchupsFilePath);
// }

// // Function to write matchups to JSON file
// function writeMatchups(userMatchupsFilePath, matchups) {
//   writeJsonFile(userMatchupsFilePath, matchups);
// }

// // Get all matchups
// router.get("/DELETE", (req, res) => {
//   debudebuggApi("Fetching all matchups");
//   const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;

//   const matchups = readMatchups(userMatchupsFilePath);
//   res.json(matchups);
// });

// router.get("/:id", async (req, res) => {
//   debug("Fetching or creating specific matchups id: ", req.params.id);
//   debug("user:", req.user.email);
//   const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;

//   let matchups = readMatchups(userMatchupsFilePath);
//   const [championAId, championBId] = req.params.id.split("-");

//   let matchup = matchups.find((m) => m.id === req.params.id);
//   debug("matchup:", matchup);
//   if (!matchup) {
//     // Matchup not found - create a new one
//     matchup = {
//       id: req.params.id,
//       champions: [
//         { id: championAId, name: championAId },
//         { id: championBId, name: championBId },
//       ],
//       personalNotes: "",
//       sharedNotes: null,
//       lastUpdated: new Date().toISOString(), // Current timestamp
//       gameVersion: await getLatestVersion(), // Fetch or define the current game version
//     };
//     matchups.push(matchup);
//     writeMatchups(userMatchupsFilePath, matchups);
//     res.status(201).json(matchup); // 201 Created
//   } else {
//     // Matchup found
//     res.json(matchup);
//   }
// });

router.get("/:id", async (req, res) => {
  const { dbPool } = req.app.locals;
  debug("Fetching or creating specific matchups id: ", req.params.id);

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
      await updateChampionData(null, dbPool);  // Pass dbPool here

      // Recheck after update
      championsCheck = await dbPool.query(
        `SELECT name FROM champions WHERE name = ANY($1::text[])`,
        [[championAName, championBName]]
      );

      if (championsCheck.rows.length !== 2) {
        return res.status(400).json({ error: "Invalid champion names." });
      }
    }

    let matchup = await dbPool.query(
      `SELECT * FROM matchups WHERE combined_id = $1`,
      [combinedId]
    );

    if (matchup.rows.length === 0) {
      matchup = await dbPool.query(
        `INSERT INTO matchups (champion_a_name, champion_b_name, combined_id) 
         VALUES ($1, $2, $3) RETURNING *;`,
        [championAName, championBName, combinedId]
      );
      const createdMatchup = snakeToCamelCase(matchup.rows[0]);
      res.status(201).json(createdMatchup);
    } else {
      const foundMatchup = snakeToCamelCase(matchup.rows[0]);
      res.json(foundMatchup);
    }
  } catch (error) {
    debug("Error accessing database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// // Create a new matchup
// router.post("/", (req, res) => {
//   debug("Create a new matchup");
//   debug("user:", req.user.email);
//   // Create the user-specific matchups file path
//   const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;
//   const matchups = readMatchups(userMatchupsFilePath);
//   const newMatchup = req.body;
//   matchups.push(newMatchup);
//   writeMatchups(userMatchupsFilePath, matchups);
//   res.status(201).json(newMatchup);
// });

// // Delete all matchups
// router.delete("/delete", (req, res) => {
//   debug("Delete all matchups");
//   writeMatchups([]);
//   res.status(204).send();
// });

// // Update a matchup's notes by id
// router.patch("/:id/notes", (req, res) => {
//   const { id } = req.params;
//   const { personalNotes } = req.body;
//   // Create the user-specific matchups file path
//   const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;

//   //const savedNote = saveNoteForUser(userEmail, noteContent);

//   // Read matchups from the user's specific file
//   const matchups = readJsonFile(userMatchupsFilePath);

//   // Find the index of the matchup to update
//   const matchupIndex = matchups.findIndex((m) => m.id === id);
//   if (matchupIndex !== -1) {
//     // Update the matchup's notes
//     matchups[matchupIndex].personalNotes = personalNotes;
//     debug("matchups note update:", matchups[matchupIndex]);
//     // Write the updated matchups back to the user's specific file
//     writeJsonFile(userMatchupsFilePath, matchups);

//     res.json(matchups[matchupIndex]);
//   } else {
//     res.status(404).json({ error: "Matchup not found" });
//   }
// });

export default router;
