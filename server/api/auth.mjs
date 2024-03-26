// api/auth.mjs
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/authMiddleware.mjs";
import { snakeToCamelCase } from "./utilities.mjs";
import Debug from "debug";
const debug = Debug("api:auth");

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
          if (result.rows.length > 0) {
            const user = snakeToCamelCase(result.rows[0]);
            debug("User: ", user);
            const match = await bcrypt.compare(password, user.passwordHash);
            if (match) {
              // User authenticated successfully
              debug("User authenticated successfully");
              return done(null, {
                email: user.email,
                username: user.username,
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
  async (req, res) => {
    const { dbPool } = req.app.locals;

    debug("User login: ", req.user);
    const user = req.user; // Your authenticated user
    const email = user.email; // Get the user's email from the authenticated user
    const id = user.id; // Get the user's ID from the authenticated user
    debug("mail", email);

    // Generate JWT
    const token = jwt.sign({ email, id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    debug("mail", email);

    // Generate Refresh Token (example, you might want to use a more secure method)
    const refreshToken = jwt.sign(
      { email, id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "354d",
      }
    );
    // Save Refresh Token in the Database
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 354); // Set expiry date 354 days from now

      // Invalidate any existing refresh token for the user
      await dbPool.query("DELETE FROM RefreshTokens WHERE user_id = $1", [id]);

      // Proceed to insert the new refresh token as before
      await dbPool.query(
        "INSERT INTO RefreshTokens (user_id, refresh_token, expiry) VALUES ($1, $2, $3)",
        [id, refreshToken, expiryDate]
      );

      // Send the response with the new tokens
      res.status(200).json({ user, token, refreshToken });
    } catch (error) {
      console.error("Error handling login:", error);
      res.status(500).send("Internal Server Error while handling login.");
    }
  }
);

router.post("/logout", verifyToken, async (req, res) => {
  const { dbPool } = req.app.locals;

  const { id } = req.user; // User's ID
  debug("User logged out: ", id);
  try {
    // Invalidate the refresh token in the database
    await dbPool.query("DELETE FROM RefreshTokens WHERE user_id = $1", [id]);
    debug("Refresh token invalidated successfully");
    res.status(200).send("User logged out successfully.");
  } catch (err) {
    debug("Error during logout", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/verifyToken", verifyToken, async (req, res) => {
  const { id } = req.user; // Assumes your middleware adds the decoded token to `req.user`
  const { dbPool } = req.app.locals;
  debug("User verifyToken: ", id);
  try {
    const result = await dbPool.query(
      "SELECT * FROM Users WHERE user_id = $1",
      [id]
    ); // Adjusted to snake_case
    if (result.rows.length > 0) {
      debug("User verified: ", result.rows[0]);
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
router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;
  const { dbPool } = req.app.locals;

  if (!refreshToken) {
    return res.status(400).send("Refresh token required.");
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.id;
    console.log("userId", userId);
    console.log("refreshToken", refreshToken);
    console.log("decoded", decoded);

    // Check if the refresh token exists, is valid, and hasn't expired
    const query =
      "SELECT * FROM RefreshTokens WHERE user_id = $1 AND refresh_token = $2 AND expiry > NOW()";
    const { rows } = await dbPool.query(query, [userId, refreshToken]);
    console.log("rows", rows);
    if (rows.length === 0) {
      debug("Invalid or expired refresh token");
      return res.status(403).send("Invalid or expired refresh token.");
    }

    // Assuming the refresh token is valid, issue a new JWT
    const newToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    debug("New token issued:", newToken);
    // Respond with the new access token (and optionally, the new refresh token)
    res.json({ accessToken: newToken});
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      debug("Refresh token expired:", error);
      res.status(403).send("Refresh token expired.");
    } else {
      console.error("Token exchange error:", error);
      res.status(500).send("Internal server error during token exchange.");
    }
  }
});

export default router;
