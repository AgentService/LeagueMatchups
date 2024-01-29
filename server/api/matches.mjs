import express from 'express';
import axios from 'axios';
import Debug from 'debug';

const router = express.Router();
const debug = Debug('api');
const RIOT_API_KEY = process.env.VITE_RIOT_API_KEY;

router.get('/last-match/:puuid', async (req, res) => {
	const { puuid } = req.params;
	const region = req.query.region || 'europe';
	const count = req.query.count || 5; // Anzahl der abzurufenden Spiele

	try {
		const matchListUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
		const matchListResponse = await axios.get(matchListUrl, {
			headers: { 'X-Riot-Token': RIOT_API_KEY }
		});

		const matchIds = matchListResponse.data;

		if (!matchIds.length) {
			return res.status(404).json({ message: 'No matches found for this player.' });
		}

		// Informationen für jedes Spiel abrufen
		const matchesInfo = await Promise.all(matchIds.map(async (matchId) => {
			const matchDetailsUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
			try {
				const response = await axios.get(matchDetailsUrl, {
					headers: { 'X-Riot-Token': RIOT_API_KEY }
				});
				return response.data;
			} catch (error) {
				debug('Error fetching match details:', error);
				return null; // Zurückgeben von null für Spiele, die nicht abgerufen werden konnten
			}
		}));

		// Filtere null Werte heraus
		const validMatchesInfo = matchesInfo.filter(info => info !== null);

		res.json(validMatchesInfo);
	} catch (error) {
		debug('Error fetching match data:', error);
		res.status(error.response?.status || 500).json({
			message: error.response?.data?.status?.message || 'An error occurred fetching the match data.'
		});
	}
});

export default router;
