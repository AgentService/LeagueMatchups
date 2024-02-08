// api/notes.mjs
import express from "express";
import Debug from "debug";

const debug = Debug("api:notes");
const router = express.Router();

// Matchup Notes
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
  const { content } = req.body; // The request body still contains `notes`, which now maps to `Content`

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
    debug("notes:", content);
    // Insert or update note in the Content column
    const { rows, rowCount } = await dbPool.query(
      `INSERT INTO MatchupNotes (UserID, MatchupID, Content, Visibility, Created_At, Updated_At)
       VALUES ($1, $2, $3, 'private', NOW(), NOW())
       ON CONFLICT (UserID, MatchupID) DO UPDATE
       SET Content = EXCLUDED.Content, Updated_At = NOW()
       RETURNING *`, // Use RETURNING * to return all columns of the affected row
      [req.user.id, matchupId, content] // `notes` from request maps to `Content` column
    );

    if (rowCount > 0) {
      // Assuming we always affect exactly one row, either by inserting or updating
      const savedNote = rows[0]; // Grab the first (and should be only) row returned by the query
      res.status(200).json({
        message: "Note saved successfully.",
        content: savedNote.content, // Return the saved or updated note data from the Content column
        updated_at: savedNote.updated_at, // Return the updated_at timestamp from the database
      });
    } else {
      res.status(400).json({ message: "Failed to save note." });
    }
  } catch (error) {
    debug("Error saving note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Champion Notes
router.post("/champion/:championName", async (req, res) => {
  const { dbPool } = req.app.locals;
  const championName = req.params.championName;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    // Verify the Champion exists
    const championResult = await dbPool.query(
      `SELECT Name FROM champions WHERE Name = $1`,
      [championName]
    );
    debug("Champion result:", championResult.rows[0]);
    if (championResult.rowCount === 0) {
      return res.status(404).json({ message: "Champion not found." });
    }

    // Insert or update the note
    const { rows, rowCount } = await dbPool.query(
      `INSERT INTO ChampionNotes (UserID, ChampionName, Content, Visibility, Created_At, Updated_At)
       VALUES ($1, $2, $3, 'private', NOW(), NOW())
       ON CONFLICT (UserID, ChampionName) DO UPDATE
       SET Content = EXCLUDED.Content, Updated_At = NOW()
       RETURNING *`,
      [userId, championName, content]
    );

    if (rowCount > 0) {
      debug("Saved note champion:", rows[0]);
      const savedNote = rows[0];
      res.status(200).json({
        message: "Note saved successfully.",
        content: savedNote.content,
        updated_at: savedNote.updated_at,
      });
    } else {
      res.status(400).json({ message: "Failed to save note." });
    }
  } catch (error) {
    debug("Error saving champion note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/champion/:championName", async (req, res) => {
  const { dbPool } = req.app.locals;
  const championName = req.params.championName;
  const userId = req.user.id; // Assuming req.user is populated and contains the user ID

  try {
    // Fetch the Champion Notes for the specified Champion and User
    const notesResult = await dbPool.query(
      `SELECT * FROM ChampionNotes WHERE ChampionName = $1 AND UserID = $2`,
      [championName, userId]
    );
    debug("Notes result champion:", notesResult.rows[0]);
    if (notesResult.rowCount > 0) {
      res.json(notesResult.rows[0]);
    } else {
      res.status(404).json({ message: "No notes found for this champion." });
    }
  } catch (error) {
    debug("Error fetching champion notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Node.js backend using Express framework
router.get("/other/:championName", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { championName } = req.params;
  const userId = req.user.id; // Assuming req.user is populated and contains the user ID

  try {
    debug("Fetching other users' notes for:", championName);
    // Fetch notes about the specified Champion that were not written by the given User
    const notesResult = await dbPool.query(
      `SELECT ChampionNotes.*, Users.Username FROM ChampionNotes
       JOIN Users ON ChampionNotes.UserID = Users.UserID
       WHERE ChampionNotes.ChampionName = $1 AND ChampionNotes.UserID != $2`,
      [championName, userId]
    );
    debug("Notes result other:", notesResult.rows);
    if (notesResult.rowCount > 0) {
      res.json(notesResult.rows);
    } else {
      res
        .status(404)
        .json({ message: "No other users' notes found for this champion." });
    }
  } catch (error) {
    console.error("Error fetching other users' champion notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// General Notes

// GET endpoint to retrieve general notes for a user
router.get("/general", async (req, res) => {
  const userId = req.user.id; // Directly use user ID
  const { dbPool } = req.app.locals;

  try {
    const { rows } = await dbPool.query(
      `SELECT * FROM generalnotes WHERE UserID = $1`,
      [userId]
    );
    res
      .status(200)
      .json({ message: "Notes retrieved successfully", notes: rows });
  } catch (error) {
    debug("Error retrieving notes:", error);
    res.status(500).json({ message: "Error retrieving notes" });
  }
});

router.post("/general", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { noteid, content } = req.body; // Use noteid if provided for updates
  const userId = req.user.id; // Directly use user ID

  try {
    if (noteid) {
      debug("Updating note:", noteid);
      // Update an existing note if noteid is provided
      const updateQuery = `
      UPDATE generalnotes
      SET Content = $1, Updated_At = NOW()
      WHERE noteid = $2 AND UserID = $3
      RETURNING *;
    `;

      const updatedNote = await dbPool.query(updateQuery, [
        content,
        noteid,
        userId,
      ]);

      debug("Note updated successfully:", updatedNote.rows[0]);
      res.status(200).json({
        message: "Note updated successfully",
        note: updatedNote.rows[0],
      });
    } else {
      debug("Inserting new note");
      // If no noteid is provided, insert a new note
      const { date } = req.body; // Date is only needed for new notes
      const noteContent = content ? content : "";
      const insertQuery = `
      INSERT INTO generalnotes (UserID, Content, Created_At, Updated_At) 
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *; 
    `;

      const insertResult = await dbPool.query(insertQuery, [
        userId,
        noteContent,
      ]);
      debug("Note inserted successfully:", noteContent);
      const newNote = insertResult.rows[0];
      res.status(200).json({
        message: "Note created successfully",
        note: newNote,
      });
    }
  } catch (error) {
    debug("Error saving the note:", error);
    res.status(500).json({ message: "Error saving the note" });
  }
});

router.delete("/general/:noteid", async (req, res) => {
  const { dbPool } = req.app.locals;
  const noteId = req.params.noteid;
  const userId = req.user.id; // Directly use user ID

  try {
    const deleteQuery = `
    DELETE FROM generalnotes
    WHERE noteid = $1 AND UserID = $2
    RETURNING *;
  `;
    debug("Deleting note:", noteId);
    const deletedNote = await dbPool.query(deleteQuery, [noteId, userId]);
    debug("Note deleted successfully:", deletedNote.rows[0]);
    res.status(200).json({
      message: "Note deleted successfully",
      note: deletedNote.rows[0],
    });
  } catch (error) {
    debug("Error deleting the note:", error);
    res.status(500).json({ message: "Error deleting the note" });
  }
});

export default router;
// server/api/notes.mjs
