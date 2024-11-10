// api/notes.mjs
import express from "express";
import { snakeToCamelCase } from "./utilities.mjs";
import { getNamespaceLogger, logInfo, logError } from "../utils/logger.mjs";
const logger = getNamespaceLogger("api:notes");

const router = express.Router();

// Rating
router.post("/champion/rating", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { noteId, rating } = req.body;
  const userId = req.user.id;
  logInfo(logger, `Rating champion note ID: ${noteId} with rating: ${rating}`, req);

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
    logError(logger, "Error updating champion note rating", req, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/matchup/rating", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { noteId, rating } = req.body;
  const userId = req.user.id;
  logInfo(logger, `Rating matchup note ID: ${noteId} with rating: ${rating}`, req);

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
    logError(logger, "Error updating matchup note rating", req, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/matchup/:id", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.id; // "a-b" format ID from the URL
  const userId = req.user?.id; // Extracted UserID from JWT
  if (!userId) {
    logError(logger, "Unauthorized access attempt: UserID not available", req);
    return res.status(401).json({ message: "Unauthorized: UserID not available." });
  }

  try {
    // Fetch the Matchup ID based on the combinedId
    const matchupResult = await dbPool.query(
      `SELECT id FROM matchups WHERE combined_id = $1`,
      [combinedId]
    );

    if (matchupResult.rowCount === 0) {
      return res.status(404).json({ message: "Matchup not found." });
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
      const foundNote = snakeToCamelCase(notesResult.rows[0]);
      logInfo(logger, `Matchup note found: ${JSON.stringify(foundNote)}`, req);
      res.json(foundNote); // Send the converted object
    } else {
      // Return an empty object with a 200 status if no notes are found
      res.status(200).json({ matchupId, notes: "" });
    }
  } catch (error) {
    logError(logger, "Error fetching matchup notes", req, error);
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
    const matchupId = matchupRows[0].id;
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
      logInfo(logger, `Matchup note saved for ID: ${combinedId}`, req);
      logInfo(logger, `Matchup note saved, content: ${savedNote.content}`, req);
      res.status(200).json({
        message: "Note saved successfully.",
        content: savedNote.content, // Return the saved or updated note data from the Content column
        updatedAt: savedNote.updatedAt, // Return the updated_at timestamp from the database
      });
    } else {
      res.status(400).json({ message: "Failed to save note." });
    }
  } catch (error) {
    logError(logger, "Error saving matchup note", req, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/matchup/others/:combinedId", async (req, res) => {
  const { dbPool } = req.app.locals;
  const combinedId = req.params.combinedId.split("-"); // combinedId is "ChampionA-ChampionB"
  const userId = req.user.id;

  try {
    const query = `
      SELECT mn.Note_ID, mn.Content, mn.Visibility, u.Username, mn.Created_At, mn.Updated_At
      FROM MatchupNotes mn
      JOIN Users u ON mn.User_ID = u.User_ID
      JOIN Matchups m ON mn.Matchup_ID = m.ID
      WHERE (m.Champion_A_Name = $1 AND m.Champion_B_Name = $2 OR m.Champion_A_Name = $2 AND m.Champion_B_Name = $1) 
        AND mn.User_ID != $3
    `;

    const notesResult = await dbPool.query(query, [...combinedId, userId]);
    logInfo(logger, `Other users' notes found for ID: ${combinedId}`, req);

    if (notesResult.rowCount === 0) {
      logInfo(logger, `No other users' notes found for ID: ${combinedId}`, req);
      return res.status(200).json([]);  // Return an empty array instead of 404
    }

    // Continue with the rest of your code...
  } catch (error) {
    logError(logger, "Error fetching other users' matchup notes", req, error);
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
    logInfo(logger, `Saving note for champion: ${championName}`, req);
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
      logInfo(logger, `Note content saved for champion: ${championName}`, req);
      logInfo(logger, `Note content saved, content: ${content}`, req);
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
    logError(logger, "Error saving champion note", req, error);
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

    if (notesResult.rowCount > 0) {
      const foundNote = snakeToCamelCase(notesResult.rows[0]);
      logInfo(logger, `Champion note found: ${JSON.stringify(foundNote)}`, req);
      res.json(foundNote); // Send the converted object
    } else {
      res.status(200).json({ championName, notes: "" });
    }
  } catch (error) {
    logError(logger, "Error fetching champion notes", req, error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/champion/others/:championName", async (req, res) => {
  const { dbPool } = req.app.locals;
  const { championName } = req.params;
  const userId = req.user.id;

  try {
    // Fetch notes
    const notesResult = await dbPool.query(
      `SELECT cn.Note_ID, cn.Content, cn.Visibility, u.Username, cn.Created_At, cn.Updated_At
       FROM ChampionNotes cn
       JOIN Users u ON cn.User_ID = u.User_ID
       WHERE cn.Champion_Name = $1 AND cn.User_ID != $2`,
      [championName, userId]
    );
    logInfo(logger, `Other users' notes found for champion: ${championName}`, req);
    if (notesResult.rowCount === 0) {
      return res.status(200).json([]);  // Return an empty array instead of 404
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

      logInfo(logger, `Matching for note_id: ${note.note_id}, Personal rating found: ${!!personalRating}, Average rating found: ${!!averageRating}`, req);

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
    logInfo(logger, `Final enriched notes: ${finalResponse}`, req);
    res.json(finalResponse);
  } catch (error) {
    logError(logger, "Error fetching other users' champion notes", req, error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// General Notes

// GET endpoint to retrieve general notes for a user
router.get("/general", async (req, res) => {
  const userId = req.user.id;
  const { dbPool } = req.app.locals;

  try {
    const query = `
    SELECT generalnotes.*, array_agg(generalnotestags.tag_id) as tags
    FROM generalnotes
    LEFT JOIN generalnotestags ON generalnotes.note_id = generalnotestags.note_id
    WHERE generalnotes.user_id = $1
    GROUP BY generalnotes.note_id;
    `;
    const { rows } = await dbPool.query(query, [userId]);
    const notesWithTags = rows.map((row) => snakeToCamelCase(row));
    res.status(200).json({
      message: "Notes retrieved successfully",
      notes: notesWithTags,
    });
  } catch (error) {
    logError(logger, "Error retrieving general notes", req, error);
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
      logInfo(logger, `Note updated successfully row: ${rows[0]}`, req);
      noteResponse = rows[0]; // Store the updated note for conversion
    } else {
      // If no noteId is provided, insert a new note
      const noteContent = content ? content : "";
      const insertQuery = `
        INSERT INTO generalnotes (user_id, content, created_at, updated_at) 
        VALUES ($1, $2, NOW(), NOW())
        RETURNING *; 
      `;

      const { rows } = await dbPool.query(insertQuery, [userId, noteContent]);
      logInfo(logger, `New note created successfully row: ${rows[0]}`, req);
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
    logError(logger, "Error saving the note", req, error);
    res.status(500).json({ message: "Error saving the note" });
  }
});

router.delete("/general/:noteid", async (req, res) => {
  const { dbPool } = req.app.locals;
  const noteId = req.params.noteid;
  const userId = req.user.id; // Directly use user ID

  try {
    // First, delete related entries in the generalnotestags table to avoid foreign key constraint errors
    const deleteTagsQuery = `DELETE FROM generalnotestags WHERE note_id = $1;`;
    await dbPool.query(deleteTagsQuery, [noteId]);

    // Then, delete the note from generalnotes
    const deleteNoteQuery = `
      DELETE FROM generalnotes
      WHERE note_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const { rows } = await dbPool.query(deleteNoteQuery, [noteId, userId]);

    if (rows.length > 0) {
      const deletedNote = snakeToCamelCase(rows[0]); // Convert to camelCase
      logInfo(logger, `Note deleted successfully row: ${deletedNote}`, req);
      res.status(200).json({
        message: "Note deleted successfully",
        note: deletedNote, // Send the converted note
      });
    } else {
      // If no rows were returned, the note wasn't found or didn't belong to the user
      res.status(404).json({ message: "Note not found or not owned by user" });
    }
  } catch (error) {
    logError(logger, "Error deleting the note", req, error);
    res.status(500).json({ message: "Error deleting the note" });
  }
});


// General Tags
router.get("/tags", async (req, res) => {
  const { dbPool } = req.app.locals;

  try {
    const { rows } = await dbPool.query(
      `SELECT * FROM Tags ORDER BY tag_name ASC`
    );
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
        `INSERT INTO GeneralNotesTags (Note_ID, Tag_ID) VALUES ($1, $2)`,
        [noteId, tagId]
      )
    );

    logInfo(logger, `Tag associations inserted noteId: ${noteId} and tagId: ${tagIds}`, req);
    // Wait for all insertions to complete
    await Promise.all(promises);

    // Commit the transaction
    await dbPool.query("COMMIT");
    res.status(200).json({ message: "Tags associated successfully" });
  } catch (error) {
    // Rollback the transaction in case of error
    await dbPool.query("ROLLBACK");
    logError(logger, "Error associating tags with the note", req, error);
    res.status(500).json({ message: "Error associating tags with the note" });
  }
});

router.delete("/general/:noteId/tags/:tagId", async (req, res) => {
  const { dbPool } = req.app.locals;
  const noteId = req.params.noteId;
  const tagId = req.params.tagId;
  try {
    const { rowCount } = await dbPool.query(
      `DELETE FROM GeneralNotesTags WHERE Note_ID = $1 AND Tag_ID = $2`,
      [noteId, tagId]
    );
    logInfo(logger, `Tag disassociated successfully noteId: ${noteId} and tagId: ${tagId}`, req);
    if (rowCount > 0) {
      res.status(200).json({ message: "Tag disassociated successfully" });
    } else {
      res.status(404).json({ message: "Tag association not found" });
    }
  } catch (error) {
    logError(logger, "Error removing tag association", req, error);
    res.status(500).json({ message: "Error removing tag association" });
  }
});

export default router;
// server/api/notes.mjs
