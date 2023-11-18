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
import "dotenv/config";
import passport from "passport";

import Debug from "debug";

import championsRouter from "./api/champions.mjs";
import summonerRouter from "./api/summoner.mjs";
import matchupsRouter from "./api/matchups.mjs";
import authRouter from "./api/auth.mjs";
import utilitiesRouter from "./api/utilities.mjs";

import { verifyToken } from "./utils/authMiddleware.mjs";


// Other imports and code


const app = express();
const PORT = 3001;

const debugApi = Debug(process.env.VITE_DEBUG);


app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// console.log('111:', process.env);

// Centralized error handling
app.use((error, req, res, ) => {
	console.error(error);
	res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
});

// Logging middleware
app.use((req, res, next) => {
	debugApi(`Incoming request on ${req.path} with method ${req.method}`);
	next();
});

app.use("/api/matchups", verifyToken);
// Routes
app.use("/api/champions", championsRouter); // Assuming championsRouter handles both GET and update routes
app.use("/summoner", summonerRouter);
app.use("/api/matchups", matchupsRouter);
app.use("/api/auth", authRouter);

app.use("/api/utilities", utilitiesRouter); 

// Start the server
app.listen(PORT, () => {
	debugApi(`Server started on port ${PORT}`);
});
