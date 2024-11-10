// auth.mjs
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/authMiddleware.mjs";
import { snakeToCamelCase } from "./utilities.mjs";
import bcrypt from "bcrypt";
import { getNamespaceLogger, logInfo, logError } from '../utils/logger.mjs'; // Import your logger
const logger = getNamespaceLogger('api:auth');

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
            logInfo(logger, `User found: ${user.email}`);
            if (!user.verified) {
              return done(null, false, { message: "Email not verified." });
            }
            const match = await bcrypt.compare(password, user.passwordHash);
            if (match) {
              // User authenticated successfully
              logInfo(logger, "Password matches");
              return done(null, {
                email: user.email,
                username: user.username,
                id: user.userId, // Make sure to include the user's ID
                role: user.role // Include role here
              });
            } else {
              // Password does not match
              logError(logger, "Incorrect password");
              return done(null, false, {
                message: "Incorrect username or password.",
              });
            }
          } else {
            // No user found with the provided email
            return done(null, false, { message: "User not found." });
          }
        } catch (err) {
          logError(logger, `Error during authentication: ${err}`);
          return done(err);
        }
      }
    )
  );
}

const router = express.Router();

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  async (req, res) => {
    const { dbPool } = req.app.locals;

    logInfo(logger, "User login: ", JSON.stringify(req.user));
    const user = req.user; // Your authenticated user
    const { email, id, role, username } = user; // Destructure role as well

    // Generate JWT
    const token = jwt.sign(
      { email, id, role, username },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { email, id, role, username },
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
      logError(logger, `Error during login: ${error}`, req);
      res.status(500).send("Internal Server Error while handling login.");
    }
  }
);

router.post("/logout", verifyToken, async (req, res) => {
  const { dbPool } = req.app.locals;

  const { id } = req.user; // User's ID
  logInfo(logger, `User logout: ${id}`, req);
  try {
    // Invalidate the refresh token in the database
    await dbPool.query("DELETE FROM RefreshTokens WHERE user_id = $1", [id]);
    logInfo(logger, "User logged out successfully", req);
    res.status(200).send("User logged out successfully.");
  } catch (err) {
    logError(logger, `Error during logout: ${err}`, req);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/verifyToken", verifyToken, async (req, res) => {
  const { id } = req.user; // Assumes your middleware adds the decoded token to `req.user`
  const { dbPool } = req.app.locals;
  logInfo(logger, `Verifying token for user: ${id}`, req);
  try {
    const result = await dbPool.query(
      "SELECT * FROM Users WHERE user_id = $1",
      [id]
    ); // Adjusted to snake_case
    if (result.rows.length > 0) {
      logInfo(logger, "User found during token verification", req);
      const user = snakeToCamelCase(result.rows[0]); // Convert user object to camelCase
      res.json({ user });
    } else {
      logError(logger, "User not found during token verification", req);
      res.status(404).send("User not found.");
    }
  } catch (err) {
    logError(logger, `Error during token verification: ${err}`, req);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;
  const { dbPool } = req.app.locals;

  if (!refreshToken) {
    logError(logger, "Refresh token required", req);
    return res.status(400).send("Refresh token required.");
  }

  try {
    // Verify the refresh token using JWT
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { id, role, username } = decoded; // Extract id, role, and username

    // Check if the refresh token exists in the database and hasn't expired
    const query =
      "SELECT * FROM RefreshTokens WHERE user_id = $1 AND refresh_token = $2 AND expiry > NOW()";
    const { rows } = await dbPool.query(query, [id, refreshToken]);

    if (rows.length === 0) {
      logError(logger, "Invalid or expired refresh token", req);
      return res.status(403).send("Invalid or expired refresh token.");
    }

    // Issue a new JWT access token with role and username
    const newToken = jwt.sign({ id, role, username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    logInfo(logger, "Token refreshed successfully", req);
    res.json({ accessToken: newToken });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logError(logger, "Refresh token expired", req);
      res.status(403).send("Refresh token expired.");
    } else {
      logError(logger, `Error during token exchange: ${error}`, req);
      res.status(500).send("Internal server error during token exchange.");
    }
  }
});

export default router;
