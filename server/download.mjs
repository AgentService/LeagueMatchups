import axios from "axios";
import fs from "fs";
import Debug from "debug";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fsPromises } from 'fs';

import { RiotAPI, DDragon } from '@fightmegg/riot-api'; // Importing RiotAPI and DDragon
import 'dotenv/config';
const debugApi = Debug("api");

// Create instances of RiotAPI and DDragon
const RIOT_API_KEY = process.env.VITE_RIOT_API_KEY;
const rAPI = new RiotAPI('RGAPI-db211fd5-c5c2-4719-add4-21f852c3dde0');
const ddragon = new DDragon(rAPI);
const baseImageUrl = "https://ddragon.leagueoflegends.com/cdn";

// Function to download and save champion images if they don't already exist
async function downloadChampionImages(champion, version) {
	const championImagePath = path.join(publicImagePath, 'champions', `${champion.id}.png`);
	const loadingImagePath = path.join(publicImagePath, 'champion_loading', `${champion.id}_0.jpg`);
	const splashImagePath = path.join(publicImagePath, 'champion_splash', `${champion.id}_0.jpg`);

	if (!(await imageExists(championImagePath))) {
		await downloadImage(`${baseImageUrl}/${version}/img/champion/${champion.id}.png`, championImagePath);
		console.log(`Downloaded and saved champion image: ${championImagePath}`);
	}

	if (!(await imageExists(loadingImagePath))) {
		await downloadImage(`${baseImageUrl}/img/champion/loading/${champion.id}_0.jpg`, loadingImagePath);
		console.log(`Downloaded and saved loading image: ${loadingImagePath}`);
	}

	if (!(await imageExists(splashImagePath))) {
		await downloadImage(`${baseImageUrl}/img/champion/splash/${champion.id}_0.jpg`, splashImagePath);
		console.log(`Downloaded and saved splash image: ${splashImagePath}`);
	}
}

// Ensure to use absolute paths for checking and downloading
// Get the __dirname equivalent in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicImagePath = path.join(__dirname, '..', 'public', 'img');

// Function to check if the image already exists
async function imageExists(imagePath) {
	try {
		await fsPromises.access(imagePath, fs.constants.F_OK);
		return true; // The file exists
	} catch (e) {
		return false; // The file does not exist
	}
}
// Function to download a single image
async function downloadImage(imageUrl, imagePath) {
	try {
		const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
		const writer = fs.createWriteStream(imagePath);

		imageResponse.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on("finish", resolve);
			writer.on("error", reject);
		});
	} catch (error) {
		console.error(`Error downloading image from ${imageUrl}:`, error);
	}
}
async function downloadAbilityImages(championData, version) {
	const abilityImagePath = path.join(publicImagePath, 'spell');
	const spells = championData.spells; // Access the spells directly from championData

	if (Array.isArray(spells)) {
		for (const ability of spells) {
			const abilityImageFullPath = path.join(abilityImagePath, ability.image.full);

			if (!(await imageExists(abilityImageFullPath))) {
				const imageUrl = `${baseImageUrl}/${version}/img/spell/${ability.image.full}`;
				await downloadImage(imageUrl, abilityImageFullPath);
				console.log(`Downloaded and saved ability image: ${abilityImageFullPath}`);
			} else {
				// console.log(`Ability image already exists: ${abilityImageFullPath}`);
			}
		}
	} else {
		console.error(`Spells data for champion ${championData.id} is not available or not an array.`);
	}
}

async function downloadPassiveImages(championData, version) {
	const passiveImagePath = path.join(publicImagePath, 'passive');
	const championName = championData.id; // Get the champion's name from championData
	const passiveImage = championData.passive.image; // Access the passive image data

	if (passiveImage) {
		const passiveImageFullPath = path.join(passiveImagePath, passiveImage.full);

		if (!(await imageExists(passiveImageFullPath))) {
			const imageUrl = `${baseImageUrl}/${version}/img/passive/${passiveImage.full}`;
			await downloadImage(imageUrl, passiveImageFullPath);
			console.log(`Downloaded and saved passive image: ${passiveImageFullPath}`);
		} else {
			// console.log(`Passive image already exists: ${passiveImageFullPath}`);
		}
	} else {
		console.error(`Passive image data for champion ${championName} is not available.`);
	}
}

async function downloadItemImages(item, version) {
	const itemImagePath = path.join(publicImagePath, 'items', `${item.image.full}`);

	if (!(await imageExists(itemImagePath))) {
		await downloadImage(`${baseImageUrl}/${version}/img/item/${item.image.full}`, itemImagePath);
		console.log(`Downloaded and saved item image: ${itemImagePath}`);
	} else {
		console.log(`Item image already exists: ${itemImagePath}`);
	}
}

async function main() {
	try {
		const version = await ddragon.versions.latest();
		if (!version) {
			throw new Error('Failed to fetch the latest version');
		}

		// // Fetches all champions with their details, which should include spells
		// const championsData = await ddragon.champion.all({ version, locale: "en_US", dataById: true });

		// // Ensure we're getting an object where each property is a champion keyed by ID
		// if (typeof championsData.data !== 'object') {
		// 	throw new Error('Champion data is not in the expected format.');
		// }

		// for (const championKey in championsData.data) {
		// 	const champion = championsData.data[championKey];
		// 	if (!champion.id) {
		// 		console.error(`Invalid champion ID for ${championKey}`);
		// 		continue;
		// 	}

		// 	// Use the champion name to fetch individual champion data
		// 	const championData = await ddragon.champion.byName({
		// 		version,
		// 		championName: champion.id,
		// 		locale: "en_US" // Set the appropriate locale
		// 	});

		// 	// Access the spells array for the champion using the champion's name as the key
		// 	const spells = championData.data[champion.id].spells;

		// 	// Now you can proceed to download ability images or perform any other actions with the spells data.
		// 	await downloadAbilityImages(championData.data[champion.id], version); // Download ability images
		// 	await downloadPassiveImages(championData.data[champion.id], version); // Download passive image

		// }
		const itemsData = await rAPI.ddragon.items({ version, locale: "en_US" });
		// Ensure we're getting an object where each property is an item keyed by ID
		if (typeof itemsData.data !== 'object') {
			throw new Error('Item data is not in the expected format.');
		}
		// Iterate over the items data
		for (const itemId in itemsData.data) {
			const item = itemsData.data[itemId];
			if (!item.name) {
				console.error(`Invalid item ID for ${itemId}`);
				continue;
			}

			await downloadItemImages(item, version); // Download item images
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
}



// Führe die Hauptfunktion aus
main();
