// item.mjs
import express from "express";
import axios from "axios";
import Debug from "debug";
import { getLatestVersion } from "./utilities.mjs"; // Import the getLatestVersion function

const router = express.Router();
const debug = Debug("api:items");
// Assume RIOT_API_KEY is available if you're using the Riot API

router.get("/all", async (req, res) => {
  try {
    const latestVersion = await getLatestVersion(); // Get the latest version
    if (!latestVersion) {
      throw new Error("Failed to retrieve the latest version");
    }
    const apiUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/item.json`;
    const response = await axios.get(apiUrl);

    // Optionally process the data here

    res.json(response.data); // Send the item data
  } catch (error) {
    debug("Error fetching item data:", error);
    res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.status?.message ||
        "An error occurred fetching the item data.",
    });
  }
});

export default router;
