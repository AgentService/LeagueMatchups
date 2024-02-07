// api/matchups.mjs
import express from "express";
import { readJsonFile, writeJsonFile } from "../utils/fileOperations.mjs";
import { getLatestVersion } from "./utilities.mjs";
import Debug from "debug";

const debug = Debug("api:matchups");
const router = express.Router();

// Function to read matchups from JSON file
function readMatchups(userMatchupsFilePath) {
  return readJsonFile(userMatchupsFilePath);
}

// Function to write matchups to JSON file
function writeMatchups(userMatchupsFilePath, matchups) {
  writeJsonFile(userMatchupsFilePath, matchups);
}

// Get all matchups
router.get("/", (req, res) => {
  debudebuggApi("Fetching all matchups");
  const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;

  const matchups = readMatchups(userMatchupsFilePath);
  res.json(matchups);
});

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
  debug("user:", req.user.email);

  const combinedId = req.params.id; // This is the "a-b" format ID used on the client

  try {
    let matchup = await dbPool.query(
      `SELECT * FROM matchups WHERE combined_id = $1`,
      [combinedId]
    );

    if (matchup.rows.length === 0) {
      // If the matchup doesn't exist, derive champion names from combinedId
      const [championAName, championBName] = combinedId.split("-");

      // Insert a new matchup
      matchup = await dbPool.query(
        `INSERT INTO matchups (champion_a_name, champion_b_name, combined_id) 
         VALUES ($1, $2, $3) RETURNING *;`,
        [championAName, championBName, combinedId]
      );
        debug("matchup inserted:", matchup.rows[0]);
      // Assuming the insert was successful, format and send the response
      const createdMatchup = matchup.rows[0];
      res.status(201).json({
        id: createdMatchup.combined_id, // Use the combined_id as the id in the response
        champion_a_name: createdMatchup.champion_a_name,
        champion_b_name: createdMatchup.champion_b_name,
      });
    } else {
      // Matchup found, format and send the response

      const foundMatchup = matchup.rows[0];
      debug("foundMatchup:", foundMatchup.combined_id);
      res.json({
        id: foundMatchup.combined_id, // Use the combined_id as the id in the response
        champion_a_name: foundMatchup.champion_a_name,
        champion_b_name: foundMatchup.champion_b_name,
      });
    }
  } catch (error) {
    debug("Error accessing database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new matchup
router.post("/", (req, res) => {
  debug("Create a new matchup");
  debug("user:", req.user.email);
  // Create the user-specific matchups file path
  const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;
  const matchups = readMatchups(userMatchupsFilePath);
  const newMatchup = req.body;
  matchups.push(newMatchup);
  writeMatchups(userMatchupsFilePath, matchups);
  res.status(201).json(newMatchup);
});

// Delete all matchups
router.delete("/delete", (req, res) => {
  debug("Delete all matchups");
  writeMatchups([]);
  res.status(204).send();
});

// Update a matchup's notes by id
router.patch("/:id/notes", (req, res) => {
  const { id } = req.params;
  const { personalNotes } = req.body;
  // Create the user-specific matchups file path
  const userMatchupsFilePath = `./user_data/${req.user.email}/matchups_data.json`;

  //const savedNote = saveNoteForUser(userEmail, noteContent);

  // Read matchups from the user's specific file
  const matchups = readJsonFile(userMatchupsFilePath);

  // Find the index of the matchup to update
  const matchupIndex = matchups.findIndex((m) => m.id === id);
  if (matchupIndex !== -1) {
    // Update the matchup's notes
    matchups[matchupIndex].personalNotes = personalNotes;
    debug("matchups note update:", matchups[matchupIndex]);
    // Write the updated matchups back to the user's specific file
    writeJsonFile(userMatchupsFilePath, matchups);

    res.json(matchups[matchupIndex]);
  } else {
    res.status(404).json({ error: "Matchup not found" });
  }
});

export default router;
