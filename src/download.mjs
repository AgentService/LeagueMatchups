
import axios from "axios";
import fs from "fs";
import path from "path";

export async function main() {
	// ... your code ...


	const riotApiUrl = "https://ddragon.leagueoflegends.com";
	const championDataPath = "/cdn/13.21.1/data/en_US/champion.json"; // Passe die Version an
	const downloadFolder = "champion_data"; // Name des Zielordners

	// Asynchrone Funktion zum Abrufen der Champion-Daten
	async function fetchChampionData() {
		try {
    
			const response = await axios.get(`${riotApiUrl}${championDataPath}`);
			return response.data.data; // Hier erhältst du die Champion-Daten
		} catch (error) {
			console.error("Error fetching champion data:", error);
			throw error;
		}
	}

	// Asynchrone Funktion zum Herunterladen und Speichern der Champion-Bilder
	async function downloadAndSaveChampionImages(championsData, version) {
		// Erstelle den Zielordner, falls er nicht existiert
		if (!fs.existsSync(downloadFolder)) {
			fs.mkdirSync(downloadFolder);
		}

		// Schleife durch die Champion-Daten und lade die Bilder herunter
		for (const championKey in championsData) {
			const champion = championsData[championKey];
			const imageUrl = `${riotApiUrl}/cdn/${version}/data/en_US/champion/${champion.id}.json`;
			const imagePath = path.join(downloadFolder, champion.id) + ".json"; // Pfad für das gespeicherte Bild
			try {
				const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
				const writer = fs.createWriteStream(imagePath);

				imageResponse.data.pipe(writer);

				await new Promise((resolve, reject) => {
					writer.on("finish", resolve);
					writer.on("error", reject);
				});

				console.log(`Downloaded and saved: ${champion.image.full}`);
			} catch (error) {
				console.error(`Error downloading image for ${champion.name}:`, error);
			}
		}
	}

	// Hauptfunktion zum Abrufen der Champion-Daten und Herunterladen der Bilder
	async function main() {
		try {
			// Rufe die Champion-Daten ab
			const championsData = await fetchChampionData();
    
			// Passe die Version an
			const version = "13.21.1";

			// Rufe die Funktion zum Herunterladen und Speichern der Champion-Bilder auf
			await downloadAndSaveChampionImages(championsData, version);
		} catch (error) {
			console.error("An error occurred:", error);
		}
	}

	// Führe die Hauptfunktion aus
	main();
}