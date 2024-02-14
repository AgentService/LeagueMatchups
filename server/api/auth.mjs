// api/auth.mjs
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/authMiddleware.mjs";
import { snakeToCamelCase } from "./utilities.mjs";
import Debug from "debug";
const debug = Debug("api:auth");

// const users = [
// 	{ email: "user@example.com", password: "password123", name: "jegaj" },
// ];

import bcrypt from "bcrypt";

// Assuming dbPool is initialized somewhere in your app setup
export function initializePassportStrategy(dbPool) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const result = await dbPool.query(
            "SELECT * FROM Users WHERE Email = $1",
            [email]
          );
          debug("Result: ", result);
          if (result.rows.length > 0) {
            const user = snakeToCamelCase(result.rows[0]);
            debug("User: ", user);
            const match = await bcrypt.compare(password, user.passwordHash);
            if (match) {
              // User authenticated successfully
              debug("User authenticated successfully");
              return done(null, {
                email: user.email,
                name: user.username,
                id: user.userId, // Make sure to include the user's ID
              });
            } else {
              // Password does not match
              debug("Password does not match");
              return done(null, false, {
                message: "Incorrect username or password.",
              });
            }
          } else {
            // No user found with the provided email
            return done(null, false, { message: "User not found." });
          }
        } catch (err) {
          console.error("Error during authentication", err);
          return done(err);
        }
      }
    )
  );
}

const router = express.Router();

// Mock user data

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    debug("User login: ", req.user);
    const user = req.user; // Your authenticated user
    const email = user.email; // Get the user's email from the authenticated user
    const id = user.id; // Get the user's ID from the authenticated user
    const token = jwt.sign({ email, id }, "your JWT secret", {
      expiresIn: "148h",
    });
    debug("User login: ", user, email);

    // Send both the user and the token in the response
    res.status(200).json({ user, token });
  }
);

router.post("/verifyToken", verifyToken, async (req, res) => {
  const { id } = req.user; // Assumes your middleware adds the decoded token to `req.user`
  const { dbPool } = req.app.locals;

  try {
    const result = await dbPool.query(
      "SELECT * FROM Users WHERE user_id = $1",
      [id]
    ); // Adjusted to snake_case
    if (result.rows.length > 0) {
      const user = snakeToCamelCase(result.rows[0]); // Convert user object to camelCase
      res.json({ user });
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    console.error("Error during user verification", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
