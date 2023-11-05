import axios from 'axios';

// const cacheDuration = 24 * 60 * 60; // 1 day in seconds
const riotApiUrl = 'https://ddragon.leagueoflegends.com';

// Function to fetch the latest version number from DDragon
export async function getLatestVersion() {
    try {
        const response = await axios.get(`${riotApiUrl}/api/versions.json`);
        const versions = response.data;
        console.log('Latest version:', versions[0]);
        return versions[0]; // Assuming the latest version is the first element
    } catch (error) {
        console.error('Error fetching latest version:', error);
        return null;
    }
}


export async function updateChampionData() {
    let listChampionsData = {};
    let detailedChampionsData = {};
  
    try {
      const version = await getLatestVersion();
      if (!version) {
        throw new Error('Failed to retrieve the latest version.');
      }
  
      // Fetch the list of all champions
      console.log('Fetching champion list...');
      const championsListResponse = await axios.get(`${riotApiUrl}/cdn/${version}/data/en_US/champion.json`);
      listChampionsData = championsListResponse.data.data; // Save the list of champions
      console.log('Champion list fetched successfully.', championsListResponse);
      // Iterate over each champion and fetch their individual data
      for (const championKey in listChampionsData) {
        const champion = listChampionsData[championKey];
        const championDataUrl = `${riotApiUrl}/cdn/${version}/data/en_US/champion/${champion.id}.json`;
  
        const response = await axios.get(championDataUrl);
        detailedChampionsData[championKey] = response.data.data; // Save the detailed data for each champion
      }
  
      console.log('All champion data updated successfully.');
  
      // Return both sets of data
      return {
        list: listChampionsData,
        details: detailedChampionsData
      };
  
    } catch (error) {
      console.error('Error updating champion data:', error);
      return null; // Indicate an error
    }
  }
// // Call the update function immediately and set an interval
//updateChampionData();
// setInterval(updateChampionData, cacheDuration * 1000); // Update data every day

let championDataCache; // This will store our cached data


export const serveChampionData = async (req, res) => {
    console.log('Request received for /api/champions');

    if (true) {
      try {
        // You only fetch new data if the cache is empty or invalidated
        championDataCache = await updateChampionData(); // This should fetch and process the data
        console.log('Champion data updated successfully:', championDataCache);
      } catch (error) {
        console.error('Failed to fetch champion data:', error);
        res.status(500).json({ error: 'Failed to fetch champion data' });
        return;
      }
    }
    // res.set('Cache-Control', `public, max-age=${cacheDuration}`);
    // If we have the data cached, we send it back to the client
    res.json(championDataCache);
  };