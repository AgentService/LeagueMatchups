// api/notes.mjs
import express from "express";
import Debug from "debug";

const debug = Debug("api:notes");
const router = express.Router();

router.get("/matchup/:id", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.id; // "a-b" format ID from the URL
  const userEmail = req.user?.email; // Ensure req.user is populated and contains email

  if (!userEmail) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User email not available." });
  }

  try {
    // Step 1: Verify the Matchup exists
    const matchupResult = await dbPool.query(
      `SELECT id FROM matchups WHERE combined_id = $1`,
      [combinedId]
    );
    if (matchupResult.rowCount === 0) {
      return res.status(404).json({ message: "Matchup not found." });
    }
    const matchupId = matchupResult.rows[0].id;
    debug("Matchup ID:", matchupId);

    // Step 2: Verify the User exists (based on email)
    const userResult = await dbPool.query(
      `SELECT userid FROM users WHERE email = $1`,
      [userEmail]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    const userId = userResult.rows[0].userid;
    debug("User ID:", userId);

    // Step 3: Fetch the Matchup Notes for the verified Matchup and User
    const notesResult = await dbPool.query(
      `SELECT mn.* 
       FROM MatchupNotes mn
       WHERE mn.MatchupID = $1 AND mn.UserID = $2`,
      [matchupId, userId]
    );
    if (notesResult.rowCount > 0) {
      res.json(notesResult.rows[0]);
      debug("Notes result:", notesResult.rows[0]);
    } else {
      res.status(404).json({ message: "No notes found for this matchup." });
    }
  } catch (error) {
    debug("Error fetching notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/matchup/:id", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.id;
  const { notes } = req.body; // Assume the note's content is sent in the request body

  try {
    const { rows: matchupRows } = await dbPool.query(
      `SELECT id FROM matchups WHERE combined_id = $1`,
      [combinedId]
    );

    if (matchupRows.length === 0) {
      return res.status(404).json({ message: "Matchup not found." });
    }
    debug("Matchup found:", matchupRows[0]);
    const matchupId = matchupRows[0].id;
    debug("req.user:", req.user.id);
    debug("notes:", notes);
    // Insert or update note
    const { rows, rowCount } = await dbPool.query(
      `INSERT INTO MatchupNotes (UserID, matchupId, notes, Visibility, Created_At, Updated_At)
       VALUES ($1, $2, $3, 'private', NOW(), NOW())
       ON CONFLICT (UserID, matchupId) DO UPDATE
       SET notes = EXCLUDED.notes, Updated_At = NOW()
       RETURNING *`, // Use RETURNING * to return all columns of the affected row
      [req.user.id, matchupId, notes]
    );

    if (rowCount > 0) {
      // Assuming we always affect exactly one row, either by inserting or updating
      const savedNote = rows[0]; // Grab the first (and should be only) row returned by the query
      res.status(200).json({
        message: "Note saved successfully.",
        note: savedNote.notes, // Return the saved or updated note data
      });
    } else {
      res.status(400).json({ message: "Failed to save note." });
    }
  } catch (error) {
    debug("Error saving note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/matchup/:id", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.id;

  try {
    const { rows: matchupRows } = await dbPool.query(
      `SELECT id FROM matchups WHERE combined_id = $1`,
      [combinedId]
    );

    if (matchupRows.length === 0) {
      return res.status(404).json({ message: "Matchup not found." });
    }

    const matchupId = matchupRows[0].id;

    await dbPool.query(
      `DELETE FROM MatchupNotes WHERE UserID = $1 AND MatchupID = $2`,
      [req.user.id, matchupId]
    );

    res.status(200).json({ message: "Note deleted successfully." });
  } catch (error) {
    debug("Error deleting note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
// server/api/notes.mjs
