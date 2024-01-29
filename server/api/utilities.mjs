import { RiotAPI } from '@fightmegg/riot-api';
const rAPI = new RiotAPI(process.env.VITE_RIOT_API_KEY);

import express from 'express';
import Debug from 'debug';
const debug = Debug('app:utilities');

export const getLatestVersion = async () => {
	try {
		debug('Fetching latest version');
		const latestVersion = await rAPI.ddragon.versions.latest();
		return latestVersion;
	} catch (error) {
		console.error('Error fetching latest version:', error);
		return null;
	}
};

const router = express.Router();

router.get('/version', async (req, res) => {
	try {
		const latestVersion = await getLatestVersion();
		if (!latestVersion) {
			res.status(500).send('Error fetching latest version');
		} else {
			res.json({ version: latestVersion });
		}
	} catch (error) {
		console.error('Error in /version endpoint:', error);
		res.status(500).send('Server error');
	}
});

export default router;


