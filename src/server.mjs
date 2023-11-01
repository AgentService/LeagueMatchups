import express from 'express';
import axios from 'axios';
import cors from 'cors';
import fs from 'fs';
import { main as downloadChampionImages } from './download.mjs';


const RIOT_API_KEY = 'RGAPI-44c9ff52-c3a6-485d-97b8-a0ef6735fe3d';  // Replace with your key

import { Kayn, REGIONS } from 'kayn';
const kayn = Kayn(RIOT_API_KEY)();

kayn.Summoner.by.name('hide on bush')
    .region(REGIONS.KOREA)
    .callback(function(error, summoner) {
        console.log(summoner)
    })

const app = express();
const PORT = 3001;  // Choose an appropriate port
app.use(cors(), express.json());
app.get('/download-champion-images', (req, res) => {
  downloadChampionImages();
  res.send('Downloading champion images.');
});

// Function to write champions to a local JSON file
function writeChampions(champions) {
  const data = JSON.stringify(champions, null, 2);
  fs.writeFileSync('./api-data/champions.json', data);
}
// Endpoint to fetch and save champion data from DDragon
app.get('/api/update-champions', (req, res) => {
  kayn.DDragon.Champion.list()
  .then(champions  => {
      console.log(champions .data);
      writeChampions(champions .data);
      res.status(200).json({ message: 'Champions updated successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: 'An error occurred while updating champions' });
    });
});


// Endpoint to get champions from the local JSON file
app.get('/api/champions', (req, res) => {
  const champions = JSON.parse(fs.readFileSync('./api-data/champions.json', 'utf8'));
  console.log("Champions endpoint " + champions)

  res.json(champions);
});

// Matchups endpoint

// Function to read matchups from JSON file
function readMatchups() {
    const rawData = fs.readFileSync('./api-data/matchups.json');
    return JSON.parse(rawData);
  }
  
  // Function to write matchups to JSON file
  function writeMatchups(matchups) {
    const data = JSON.stringify(matchups, null, 2);
    fs.writeFileSync('./api-data/matchups.json', data);
  }
  
  app.get('/api/matchups', (req, res) => {
    const matchups = readMatchups();
    res.json(matchups);
  });

  app.get('/api/matchups/:id', (req, res) => {
    const matchups = readMatchups();
    
    // Corrected the logging statements
    console.log("matchups", matchups); 

    const matchup = matchups.find(m => m.id === req.params.id);
    
    // Corrected the logging statements
    console.log("matchup", matchup); 

    if (matchup) {
      res.json(matchup);
    } else {
      res.json({ message: 'Matchup not found' });
    }
  });
  
  app.post('/api/matchups', (req, res) => {
    const matchups = readMatchups();
    const newMatchup = req.body;
    matchups.push(newMatchup);
    writeMatchups(matchups);
    res.status(201).json(newMatchup);
  });

  app.delete('/api/matchups/delete', (req, res) => {
    writeMatchups([]); // Clearing the JSON file
    res.status(204).send(); // Respond with a 204 No Content status to indicate successful deletion
  });

  app.patch('/api/matchups/:id/notes', (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const matchups = readMatchups();
      
      const matchup = matchups.find(m => m.id === id);
      if (matchup) {
        matchup.notes = notes; // Update the notes
        writeMatchups(matchups); // Save the updated matchups back to the JSON file
        res.status(200).json(matchup); // Respond with the updated matchup
      } else {
        res.status(404).json({ error: 'Matchup not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating notes' });
    }
  });
  
// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});



// Path: src/store/index.js