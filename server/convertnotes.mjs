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
    password: "dbadmin8537", // Ensure to use secure handling for production passwords
    port: 5432,
  });
}

// Database pool
const dbPool = initializeDatabase();

// Path to your JSON file containing champion notes
const championNotesFilePath = path.join(
  __dirname,
  "user_data",
  "markusromaniw@gmx.de",
  "champions_data.json"
);

async function processChampionNotes(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const championsNotes = JSON.parse(fileContent);

    for (const [championName, notesData] of Object.entries(championsNotes)) {
      // Check if personalNotes exists and is not null or empty
      const personalNotes = notesData.personalNotes;
      if (!personalNotes || personalNotes.trim() === "") {
        console.warn(
          `No personal notes provided for champion: ${championName}. Skipping...`
        );
        continue; // Skip to the next iteration if personalNotes is null or empty
      }

      // Proceed with database checks and updates as before
      let championResult = await dbPool.query(
        `SELECT Name FROM champions WHERE Name = $1`,
        [championName]
      );

      if (championResult.rowCount === 0) {
        console.warn(`Champion ${championName} not found in the database.`);
        continue;
      }

      const noteCheckResult = await dbPool.query(
        `SELECT NoteID, Content FROM ChampionNotes WHERE UserID = 8 AND ChampionName = $1`,
        [championName]
      );

      if (noteCheckResult.rowCount === 0) {
        await dbPool.query(
          `INSERT INTO ChampionNotes (UserID, ChampionName, Content, Visibility, Created_At, Updated_At) VALUES (8, $1, $2, 'private', NOW(), NOW())`,
          [championName, personalNotes]
        );
      } else {
        await dbPool.query(
          `UPDATE ChampionNotes SET Content = $2, Updated_At = NOW() WHERE UserID = 8 AND ChampionName = $1`,
          [championName, personalNotes]
        );
      }
    }
  } catch (error) {
    console.error("Error processing champion notes:", error);
  } finally {
    await dbPool.end();
  }
}

// Execute the function to process champion notes
processChampionNotes(championNotesFilePath);
