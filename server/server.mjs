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
import { initializePassportStrategy } from "./api/auth.mjs"; // Adjust based on your file structure


import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import pg from "pg";
const { Pool } = pg;

// Import logger
import { getNamespaceLogger, logInfo, logError } from "./utils/logger.mjs";
const logger = getNamespaceLogger("api:server");

const app = express();
const PORT = process.env.PORT || 8080;

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
    "VITE_API_BASE_URL",
  ];

  for (const secretName of secrets) {
    try {
      const secretPath = `projects/${projectName}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name: secretPath });
      const secretValue = version.payload.data.toString("utf8");
      process.env[secretName] = secretValue;
      logInfo(logger, `Secret ${secretName} fetched successfully`);
    } catch (error) {
      logError(logger, `Failed to fetch secret ${secretName}`, null, error);
    }
  }
  logInfo(logger, "Secrets fetched and set successfully.");
}

async function startServer() {
  const dbPool = initializeDatabase();
  app.locals.dbPool = dbPool;

  app.use(cors());
  app.use(express.json());

  initializePassportStrategy(dbPool);
  app.use(passport.initialize());

  // Apply middleware
  app.use("/api/matchups", verifyToken);
  app.use("/api/champions", championsRouter);
  app.use("/summoner", verifyToken);
  app.use("/summoner", summonerRouter);
  app.use("/api/matchups", matchupsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/user", userManagementRouter);
  app.use("/api/utilities", utilitiesRouter);
  app.use("/api/matches", matchesRouter);
  app.use("/api/generalNotes", generalNotes);
  app.use("/api/items", itemRouter);
  app.use("/api/notes", verifyToken);
  app.use("/api/notes", notes);

  // Health check route
  app.get("/health", (req, res) => {
    logInfo(logger, "Health check endpoint accessed");
    res.status(200).send({ status: "up" });
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    logError(logger, "Unhandled server error", req, error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  });

  // Logging middleware for incoming requests
  app.use((req, res, next) => {
    // logInfo(logger, `Incoming request on ${req.path} with method ${req.method}`, req);
    next();
  });

  app.listen(PORT, () => {
    logInfo(logger, `Server is running on ${PORT}`);
    logInfo(logger, `- API Endpoints initialized`);
  });
}

if (process.env.NODE_ENV === "development") {
  logInfo(logger, "Starting server in development mode");
  import("dotenv").then((dotenv) => {
    dotenv.config();

    logInfo(logger, "Initializing Riot API client in development");
    initializeRiotAPI();

    logInfo(logger, "Starting the server...");
    startServer().then(() => {
      const { dbPool } = app.locals;
      logInfo(logger, "Server started, initializing champion data cache...");
      initializeChampionDataCache(dbPool)
        .then(() => logInfo(logger, "Champion data cache initialized successfully in development"))
        .catch((error) => logError(logger, "Error initializing champion data cache", null, error));
    });
  });
} else {
  logInfo(logger, "Starting server in production mode");
  dotenv.config();

  fetchAndSetSecrets()
    .then(() => {
      logInfo(logger, "Secrets fetched and set successfully in production");
      logInfo(logger, "Initializing Riot API client");
      initializeRiotAPI();

      logInfo(logger, "Starting the server...");
      return startServer();
    })
    .then(() => {
      const { dbPool } = app.locals;
      logInfo(logger, "Server started, initializing champion data cache...");
      return initializeChampionDataCache(dbPool);
    })
    .then(() => {
      logInfo(logger, "Champion data cache initialized successfully in production");
    })
    .catch((error) => {
      logError(logger, "Error during server startup or champion data cache initialization", null, error);
    });
}
