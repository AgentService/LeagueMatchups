// api/notes.mjs
import express from "express";
import Debug from "debug";
import { snakeToCamelCase } from "./utilities.mjs";

const debug = Debug("api:notes");
const router = express.Router();

// Rating
router.post("/champion/rating", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { noteId, rating } = req.body;
  const userId = req.user.id;
  debug("Note ID:", noteId);
  debug("Rating:", rating);
  try {
    // Insert or update the rating
    const { rowCount } = await dbPool.query(
      `INSERT INTO ChampionNotesRating (Note_ID, User_ID, Rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (Note_ID, User_ID) DO UPDATE
       SET Rating = EXCLUDED.Rating
       RETURNING *`,
      [noteId, userId, rating]
    );
    if (rowCount > 0) {
      res.status(200).json({ message: "Rating updated successfully." });
    } else {
      res.status(404).json({ message: "Failed to update rating." });
    }
  } catch (error) {
    console.error("Error updating champion note rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/matchup/rating", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { noteId, rating } = req.body;
  const userId = req.user.id;
  debug("Note ID:", noteId);
  debug("Rating:", rating);
  try {
    // Insert or update the rating
    const { rowCount } = await dbPool.query(
      `INSERT INTO MatchupNotesRating (Note_ID, User_ID, Rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (Note_ID, User_ID) DO UPDATE
       SET Rating = EXCLUDED.Rating
       RETURNING *`,
      [noteId, userId, rating]
    );
    if (rowCount > 0) {
      res.status(200).json({ message: "Rating updated successfully." });
    } else {
      res.status(404).json({ message: "Failed to update rating." });
    }
  } catch (error) {
    console.error("Error updating champion note rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Matchup Notes
router.get("/matchup/:id", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.id; // "a-b" format ID from the URL
  const userId = req.user?.id; // Extracted UserID from JWT
  if (!userId) {
    debug("Unauthorized: UserID not available.");
    return res
      .status(401)
      .json({ message: "Unauthorized: UserID not available." });
  }

  try {
    // Verify the Matchup exists and the user has access
    const matchupResult = await dbPool.query(
      `SELECT m.id FROM matchups m
       INNER JOIN matchupnotes mn ON m.id = mn.matchup_id
       WHERE m.combined_id = $1 AND mn.user_id = $2`,
      [combinedId, userId]
    );
    if (matchupResult.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Matchup not found or user does not have access." });
    }
    const matchupId = matchupResult.rows[0].id;

    // Fetch the Matchup Notes for the verified Matchup and User
    const notesResult = await dbPool.query(
      `SELECT mn.* 
       FROM MatchupNotes mn
       WHERE mn.Matchup_ID = $1 AND mn.User_ID = $2`,
      [matchupId, userId]
    );
    if (notesResult.rowCount > 0) {
      const foundNote = snakeToCamelCase(notesResult.rows[0]); // Assume this function converts database snake_case to camelCase for the response
      debug("Notes result:", foundNote);
      res.json(foundNote); // Send the converted object
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
      `INSERT INTO MatchupNotes (User_ID, Matchup_ID, Content, Visibility, Created_At, Updated_At)
       VALUES ($1, $2, $3, 'private', NOW(), NOW())
       ON CONFLICT (User_ID, Matchup_ID) DO UPDATE
       SET Content = EXCLUDED.Content, Updated_At = NOW()
       RETURNING *`, // Use RETURNING * to return all columns of the affected row
      [req.user.id, matchupId, content] // `notes` from request maps to `Content` column
    );

    if (rowCount > 0) {
      // Assuming we always affect exactly one row, either by inserting or updating
      const savedNote = snakeToCamelCase(rows[0]); // Convert to camelCase

      res.status(200).json({
        message: "Note saved successfully.",
        content: savedNote.content, // Return the saved or updated note data from the Content column
        updatedAt: savedNote.updatedAt, // Return the updated_at timestamp from the database
      });
    } else {
      res.status(400).json({ message: "Failed to save note." });
    }
  } catch (error) {
    debug("Error saving note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/matchup/others/:combinedId", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.combinedId.split("-"); // combinedId is "ChampionA-ChampionB"
  const userId = req.user.id;
  debug("Fetching other users' notes for:", combinedId);
  debug("User ID:", userId);

  try {
    const query = `
      SELECT mn.Note_ID, mn.Content, mn.Visibility, u.Username, mn.Created_At, mn.Updated_At
      FROM MatchupNotes mn
      JOIN Users u ON mn.User_ID = u.User_ID
      JOIN Matchups m ON mn.Matchup_ID = m.ID
      WHERE (m.Champion_A_Name = $1 AND m.Champion_B_Name = $2 OR m.Champion_A_Name = $2 AND m.Champion_B_Name = $1) AND mn.User_ID != $3
    `;
    const notesResult = await dbPool.query(query, [...combinedId, userId]);

    if (notesResult.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No other users' notes found for this matchup." });
    }

    const noteIds = notesResult.rows.map((row) => row.note_id);

    const personalRatingResult = await dbPool.query(
      `
      SELECT Note_ID, Rating, Is_Favorite
      FROM MatchupNotesRating
      WHERE User_ID = $2 AND Note_ID = ANY($1::int[])`,
      [noteIds, userId]
    );

    const averageRatingResult = await dbPool.query(
      `
      SELECT Note_ID, AVG(Rating) AS AverageRating
      FROM MatchupNotesRating
      WHERE Note_ID = ANY($1::int[])
      GROUP BY Note_ID`,
      [noteIds]
    );

    const enrichedNotes = notesResult.rows.map((note) => {
      const personalRating = personalRatingResult.rows.find(
        (rating) => rating.note_id === note.note_id
      );
      const averageRating = averageRatingResult.rows.find(
        (rating) => rating.note_id === note.note_id
      );

      return {
        ...note,
        personalRating: personalRating ? personalRating.rating : undefined,
        isFavorite: personalRating ? personalRating.is_favorite : undefined,
        averageRating: averageRating
          ? parseFloat(averageRating.averagerating).toFixed(2)
          : undefined,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      };
    });

    const finalResponse = enrichedNotes.map((note) => snakeToCamelCase(note));

    res.json(finalResponse);
  } catch (error) {
    console.error("Error fetching other users' matchup notes:", error);
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
      `INSERT INTO ChampionNotes (User_ID, Champion_Name, Content, Visibility, Created_At, Updated_At)
       VALUES ($1, $2, $3, 'private', NOW(), NOW())
       ON CONFLICT (User_ID, Champion_Name) DO UPDATE
       SET Content = EXCLUDED.Content, Updated_At = NOW()
       RETURNING *`,
      [userId, championName, content]
    );

    if (rowCount > 0) {
      debug("Saved note champion:", rows[0]);
      const savedNote = snakeToCamelCase(rows[0]); // Convert to camelCase
      res.status(200).json({
        message: "Note saved successfully.",
        content: savedNote.content, // Adjusted to camelCase
        updatedAt: savedNote.updatedAt, // Adjusted to camelCase
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
      `SELECT * FROM ChampionNotes WHERE Champion_Name = $1 AND User_ID = $2`,
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

router.get("/champion/others/:championName", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { championName } = req.params;
  const userId = req.user.id;

  try {
    debug("Fetching other users' notes for:", championName);

    // Fetch notes
    const notesResult = await dbPool.query(
      `SELECT cn.Note_ID, cn.Content, cn.Visibility, u.Username, cn.Created_At, cn.Updated_At
       FROM ChampionNotes cn
       JOIN Users u ON cn.User_ID = u.User_ID
       WHERE cn.Champion_Name = $1 AND cn.User_ID != $2`,
      [championName, userId]
    );

    debug("Notes result other:", notesResult.rows);

    if (notesResult.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No other users' notes found for this champion." });
    }

    // Extract Note IDs
    const noteIds = notesResult.rows.map((row) => row.note_id);

    // Fetch personal ratings for these notes
    const personalRatingResult = await dbPool.query(
      `SELECT Note_ID, Rating, Is_Favorite
       FROM ChampionNotesRating
       WHERE User_ID = $2 AND Note_ID = ANY($1::int[])`,
      [noteIds, userId]
    );

    debug("Personal ratings:", personalRatingResult.rows);

    // Calculate average ratings for these notes
    const averageRatingResult = await dbPool.query(
      `SELECT Note_ID, AVG(Rating) AS AverageRating
       FROM ChampionNotesRating
       WHERE Note_ID = ANY($1::int[])
       GROUP BY Note_ID`,
      [noteIds]
    );

    // Map through each note to enrich it with personal and average ratings
    const enrichedNotes = notesResult.rows.map((note) => {
      const personalRating = personalRatingResult.rows.find(
        (rating) => rating.note_id === note.note_id
      );
      const averageRating = averageRatingResult.rows.find(
        (rating) => rating.note_id === note.note_id
      );

      console.debug(
        `Matching for note_id: ${
          note.note_id
        }, Personal rating found: ${!!personalRating}, Average rating found: ${!!averageRating}`
      );

      return {
        ...note,
        personalRating: personalRating ? personalRating.rating : undefined,
        isFavorite: personalRating ? personalRating.is_favorite : undefined,
        averageRating: averageRating
          ? parseFloat(averageRating.averagerating).toFixed(2)
          : undefined,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      };
    });

    // Ensure the keys are in camelCase before sending the response
    const finalResponse = enrichedNotes.map((note) => snakeToCamelCase(note));

    debug("Final enriched notes:", finalResponse);
    res.json(finalResponse);
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
      `SELECT * FROM generalnotes WHERE User_ID = $1`,
      [userId]
    );
    res.status(200).json({
      message: "Notes retrieved successfully",
      notes: rows.map((row) => snakeToCamelCase(row)), // Convert each note to camelCase
    });
  } catch (error) {
    debug("Error retrieving notes:", error);
    res.status(500).json({ message: "Error retrieving notes" });
  }
});

router.post("/general", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { noteId, content } = req.body; // Use noteId if provided for updates
  const userId = req.user.id; // Directly use user ID

  try {
    let noteResponse;
    if (noteId) {
      debug("Updating note:", noteId);
      // Update an existing note if noteid is provided
      const updateQuery = `
        UPDATE generalnotes
        SET content = $1, updated_at = NOW()
        WHERE note_id = $2 AND user_id = $3
        RETURNING *;
      `;

      const { rows } = await dbPool.query(updateQuery, [
        content,
        noteId,
        userId,
      ]);
      debug("Note updated successfully:", rows[0]);
      noteResponse = rows[0]; // Store the updated note for conversion
    } else {
      debug("Inserting new note");
      // If no noteId is provided, insert a new note
      const noteContent = content ? content : "";
      const insertQuery = `
        INSERT INTO generalnotes (user_id, content, created_at, updated_at) 
        VALUES ($1, $2, NOW(), NOW())
        RETURNING *; 
      `;

      const { rows } = await dbPool.query(insertQuery, [userId, noteContent]);
      debug("Note inserted successfully:", noteContent);
      noteResponse = rows[0]; // Store the new note for conversion
    }

    // Convert the note object from snake_case to camelCase before sending the response
    const convertedNote = snakeToCamelCase(noteResponse);

    res.status(200).json({
      message: noteId
        ? "Note updated successfully"
        : "Note created successfully",
      note: convertedNote, // Send the converted note
    });
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
    WHERE note_id = $1 AND User_ID = $2
    RETURNING *;
  `;
    debug("Deleting note:", noteId);
    const { rows } = await dbPool.query(deleteQuery, [noteId, userId]);
    if (rows.length > 0) {
      const deletedNote = snakeToCamelCase(rows[0]); // Convert to camelCase
      debug("Note deleted successfully:", deletedNote);
      res.status(200).json({
        message: "Note deleted successfully",
        note: deletedNote, // Send the converted note
      });
    } else {
      // If no rows returned, the note wasn't found or didn't belong to the user
      res.status(404).json({ message: "Note not found or not owned by user" });
    }
  } catch (error) {
    debug("Error deleting the note:", error);
    res.status(500).json({ message: "Error deleting the note" });
  }
});

// General Tags
router.get("/tags", async (req, res) => {
  const { dbPool } = req.app.locals;

  try {
    const { rows } = await dbPool.query(`SELECT * FROM Tags`);
    res.status(200).json({
      message: "Tags retrieved successfully",
      tags: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tags" });
  }
});

router.post("/general/:noteId/tags", async (req, res) => {
  const { dbPool } = req.app.locals;
  const noteId = req.params.noteId;
  const { tagIds } = req.body; // Expect an array of tagIds to associate with the note

  try {
    // Begin a transaction
    await dbPool.query("BEGIN");

    // Insert tag associations
    const promises = tagIds.map((tagId) =>
      dbPool.query(
        `INSERT INTO GeneralNotesTags (NoteID, TagID) VALUES ($1, $2)`,
        [noteId, tagId]
      )
    );

    // Wait for all insertions to complete
    await Promise.all(promises);

    // Commit the transaction
    await dbPool.query("COMMIT");

    res.status(200).json({ message: "Tags associated successfully" });
  } catch (error) {
    // Rollback the transaction in case of error
    await dbPool.query("ROLLBACK");
    res.status(500).json({ message: "Error associating tags with the note" });
  }
});

router.delete("/general/:noteId/tags/:tagId", async (req, res) => {
  const { dbPool } = req.app.locals;
  const noteId = req.params.noteId;
  const tagId = req.params.tagId;

  try {
    const { rowCount } = await dbPool.query(
      `DELETE FROM GeneralNotesTags WHERE NoteID = $1 AND TagID = $2`,
      [noteId, tagId]
    );

    if (rowCount > 0) {
      res.status(200).json({ message: "Tag disassociated successfully" });
    } else {
      res.status(404).json({ message: "Tag association not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error removing tag association" });
  }
});

export default router;
// server/api/notes.mjs
