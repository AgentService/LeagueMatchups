import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const { Pool } = pg;

// Correctly derive the __dirname equivalent in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize the database connection
function initializeDatabase() {
  return new Pool({
    user: "dbadmin",
    host: "35.198.153.152",
    database: "db-1",
    password: "", // Ensure to use secure handling for production passwords
    port: 5432,
  });
}

// Database pool
const dbPool = initializeDatabase();

// Path to your JSON file
const filePath = path.join(
  __dirname,
  "user_data",
  "user@example.com",
  "matchups_data2.json"
);
async function processMatchups(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const notes = JSON.parse(fileContent);

    for (const note of notes) {
      const { id, personalNotes } = note;
      const [championA, championB] = id.split("-");

      let matchupResult = await dbPool.query(
        `SELECT id FROM matchups WHERE combined_id = $1`,
        [id]
      );
      let matchupId;

      if (matchupResult.rowCount === 0) {
        matchupResult = await dbPool.query(
          `INSERT INTO matchups (champion_a_name, champion_b_name, combined_id) VALUES ($1, $2, $3) RETURNING id`,
          [championA, championB, id]
        );
      }
      matchupId = matchupResult.rows[0].id;

      const noteCheckResult = await dbPool.query(
        `SELECT NoteID, Content FROM MatchupNotes WHERE UserID = 8 AND MatchupID = $1`,
        [matchupId]
      );

      if (noteCheckResult.rowCount === 0) {
        await dbPool.query(
          `INSERT INTO MatchupNotes (UserID, MatchupID, Content, Visibility, Created_At, Updated_At) VALUES (8, $1, $2, 'private', NOW(), NOW())`,
          [matchupId, personalNotes]
        );
      } else {
        const existingContent = noteCheckResult.rows[0].Content;
        console.log(noteCheckResult.rows); // To inspect what's actually returned
        console.log(existingContent); // To see the value of existingContent before calling .trim() on it
        // Check if the content is explicitly null or an empty string before attempting to use .trim()
        if (
          existingContent === null ||
          (typeof existingContent === "string" && existingContent.trim() === "")
        ) {
          await dbPool.query(
            `UPDATE MatchupNotes SET Content = $2, Updated_At = NOW() WHERE UserID = 8 AND MatchupID = $1`,
            [matchupId, personalNotes]
          );
        }
        // If the content is already present and not empty, do nothing.
      }
    }
  } catch (error) {
    console.error("Error processing matchups data:", error);
  } finally {
    dbPool.end();
  }
}

// Execute the function to process matchups
processMatchups(filePath);
