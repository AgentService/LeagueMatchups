// GET /api/champions
// GET /summoner/:region/:name
// GET /summoner/by-riot-id
// GET /api/update-champions
// GET /api/matchups
// GET /api/matchups/:id
// POST /api/matchups
// DELETE /api/matchups/delete
// PATCH /api/matchups/:id/notes

// api-data/champion_data/ChampionInfos.json
// project-root/
// |-- api/
// |   |-- champions.mjs
// |   |-- summoners.mjs
// |   |-- matchups.mjs
// |   |-- images.mjs
// |-- utils/
// |   |-- fileOperations.mjs
// |-- server.mjs

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import passport from "passport";

import { verifyToken } from "./utils/authMiddleware.mjs";
import { initializeRiotAPI } from "./api/utilities.mjs";
import { initializeChampionDataCache } from "./api/champions.mjs";

import championsRouter from "./api/champions.mjs";
import summonerRouter from "./api/summoner.mjs";
import matchupsRouter from "./api/matchups.mjs";
import authRouter from "./api/auth.mjs";
import utilitiesRouter from "./api/utilities.mjs";
import matchesRouter from "./api/matches.mjs";
import generalNotes from "./api/generalNotes.mjs";
import itemRouter from "./api/items.mjs";
import notes from "./api/notes.mjs";
import userManagementRouter from "./api/userManagement.mjs";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import Debug from "debug";
const debug = Debug("server");
import { initializePassportStrategy } from "./api/auth.mjs"; // Adjust based on your file structure

Debug.enable(process.env.DEBUG);
debug("Debug is enabled");
import pg from "pg";
const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 8080; // GCP
// const PORT = process.env.PORT || 80; // Ensure PORT is defined

// Function to initialize the database connection
function initializeDatabase() {
  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

async function fetchAndSetSecrets() {
  // Assuming you have set up your Google Cloud Secret Manager client
  const client = new SecretManagerServiceClient();
  const projectName = "seismic-catbird-402416";
  const secrets = [
    "VITE_RIOT_API_KEY",
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "DB_PORT",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "BREVO_API_KEY",
    "VITE_API_BASE_URL"
  ];

  for (const secretName of secrets) {
    try {
      const secretPath = `projects/${projectName}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name: secretPath });
      const secretValue = version.payload.data.toString("utf8");
      process.env[secretName] = secretValue;
      debug(`Secret ${secretName} fetched successfully: ${secretValue}`);
    } catch (error) {
      debug(`Failed to fetch secret ${secretName}: ${error.message}`);
    }
  }
  debug("Secrets fetched and set successfully.");
}

async function startServer() {
  const dbPool = initializeDatabase(); // Now it's safe to initialize the database
  app.locals.dbPool = dbPool; // Optional: Make pool accessible in route handlers

  app.use(cors());
  app.use(express.json());

  initializePassportStrategy(dbPool);
  app.use(passport.initialize());

  app.use("/api/matchups", verifyToken);
  app.use("/api/champions", championsRouter); // Assuming championsRouter handles both GET and update routes
  // Logger middleware to check req.user
  app.use("/summoner", verifyToken);
  app.use("/summoner", summonerRouter);

  app.use("/api/matchups", matchupsRouter);

  app.use("/api/auth", authRouter);
  app.use("/api/user", userManagementRouter); // Route user management endpoints

  app.use("/api/utilities", utilitiesRouter);

  app.use("/api/matches", matchesRouter);
  app.use("/api/generalNotes", generalNotes);
  app.use("/api/items", itemRouter);

  app.use("/api/notes", verifyToken);
  app.use("/api/notes", notes);

  // Health check route
  app.get("/health", (req, res) => {
    res.status(200).send({ status: "up" });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error, req, res, next) => {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  });

  // Logging middleware
  app.use((req, res, next) => {
    debug(`Incoming request on ${req.path} with method ${req.method}`);
    next();
  });

  app.listen(PORT, () => {
    debug(`Server is running on ${PORT}`);
    debug(`- Home: ${PORT}/`);
    debug(`- API Endpoints:`);
    debug(`   - Champions: /api/champions`);
    debug(`   - Summoner by Name: /summoner/:region/:name`);
    debug(`   - Summoner by Riot ID: /summoner/by-riot-id`);
    debug(`   - Update Champions: /api/update-champions`);
    debug(`   - Matchups: /api/matchups`);
    debug(`   - Authentication: /api/auth`);
    debug(`   - User Management: /api/user`);
    debug(`   - Utilities: /api/utilities`);
    debug(`   - Matches: /api/matches`);
    debug(`   - General Notes: /api/generalNotes`);
    debug(`   - Items: /api/items`);
    debug(`   - Notes: /api/notes`);
    debug(`   - Health Check: /health`);
    if (dbPool) {
      debug(
        "Database connection initialized successfully and is ready to use!"
      );
    }
  });
}

if (process.env.NODE_ENV === "development") {
  debug("Starting server in development mode", process.env.NODE_ENV);
  import("dotenv").then((dotenv) => {
    dotenv.config();
    initializeRiotAPI(); // Initialize Riot API client after loading .env
    initializeChampionDataCache(); // Initialize champion data cache
    startServer();
  });
} else {
  debug("Starting server in production mode");
  dotenv.config(); // Load environment variables
  fetchAndSetSecrets()
    .then(initializeRiotAPI)
    .then(initializeChampionDataCache)
    .then(startServer) // Your function to start the server, define routes, etc.
    .catch(console.error); // Proper error handling
}

// else {
// 	debug("Starting server in production mode");
// 	initializeRiotAPI()
// 	initializeChampionDataCache()
// 	startServer() // Your function to start the server, define routes, etc.
// 	  .catch(console.error); // Proper error handling
//   }
