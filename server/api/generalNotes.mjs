import express from "express";
import fs from "fs";
import path from "path";
import {
  verifyToken,
  extractEmailFromToken,
} from "../utils/authMiddleware.mjs";
import { readJsonFile, writeJsonFile } from "../utils/fileOperations.mjs";

const router = express.Router();
router.use(verifyToken); // Apply to all routes in this router

router.get("/notes", extractEmailFromToken, (req, res) => {
  const userEmail = req.user.email; // Extract email from the user object
  const filePath = `./user_data/${userEmail}/general_notes.json`;

  try {
    // Read existing notes
    const notes = readJsonFile(filePath);
    res
      .status(200)
      .json({ message: "Notes retrieved successfully", notes: notes });
  } catch (error) {
    console.error("Error retrieving notes:", error);
    res.status(500).json({ message: "Error retrieving notes" });
  }
});

// POST endpoint to save a note
router.use("/save", extractEmailFromToken, (req, res) => {
  const { date, note } = req.body;
  const userEmail = req.user.email; // Extract email from the user object
  const filePath = `./user_data/${userEmail}/general_notes.json`;

  try {
    // Read existing notes
    let notes = {};
    try {
      console.log("Reading the existing notes file.");
      notes = readJsonFile(filePath);
    } catch (error) {
      // If the file doesn't exist, start with an empty object
      console.log("Starting with a new notes file.");
    }

    // Save or update the note
    notes[date] = note;
    console.log("Saving the note:", note);
    // Write the updated notes back to the file
    writeJsonFile(filePath, notes);

    res.status(200).json({ message: "Note saved successfully", note: note });
  } catch (error) {
    console.error("Error saving the note:", error);
    res.status(500).json({ message: "Error saving the note" });
  }
});

// DELETE endpoint to delete a note
router.delete("/delete/:date", extractEmailFromToken, (req, res) => {
  const { date } = req.params;
  const userEmail = req.user.email; // Extract email from the user object
  const filePath = `./user_data/${userEmail}/general_notes.json`;

  try {
    // Read existing notes
    const notes = readJsonFile(filePath);

    // Delete the note
    if (date in notes) {
      delete notes[date];
      writeJsonFile(filePath, notes);
      res.status(200).json({ message: "Note deleted successfully" });
    } else {
      res.status(404).json({ message: "Note not found" });
    }
  } catch (error) {
    console.error("Error deleting the note:", error);
    res.status(500).json({ message: "Error deleting the note" });
  }
});

export default router;
