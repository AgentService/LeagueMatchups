// userManagement.mjs
import express from "express";
import bcrypt from "bcrypt";
import Debug from "debug";
const debug = Debug("api:userManagement");
import { snakeToCamelCase } from "./utilities.mjs";

const router = express.Router();

// User Registration Endpoint
router.post("/register", async (req, res) => {
  const { dbPool } = req.app.locals;

  debug("registering user");
  debug("DB_USER", process.env.DB_USER);
  debug("DB_HOST", process.env.DB_HOST);
  debug("DB_NAME", process.env.DB_NAME);
  debug("DB_PASSWORD", process.env.DB_PASSWORD);
  debug("DB_PORT", process.env.DB_PORT);

  const { username, email, password } = req.body; // Adjust based on the input fields from your registration form

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // Insert the new user into the database
    const result = await dbPool.query(
      "INSERT INTO Users (username, Email, Password_Hash) VALUES ($1, $2, $3) RETURNING user_id, username, Email",
      [username, email, hashedPassword] // Note the comma at the end of the SQL query string
    );
    let newUser = result.rows[0];
    newUser = snakeToCamelCase(newUser); // Convert newUser object to camelCase

    // Exclude the password hash when returning the created user
    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
