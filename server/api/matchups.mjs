// api/matchups.mjs
import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileOperations.mjs';
import Debug from 'debug';
const debugApi = Debug('api');
const router = express.Router();

// Function to read matchups from JSON file
function readMatchups() {
  return readJsonFile('./api-data/matchups.json');
}

// Function to write matchups to JSON file
function writeMatchups(matchups) {
  writeJsonFile('./api-data/matchups.json', matchups);
}

// Get all matchups
router.get('/', (req, res) => {
  debugApi('Fetching all matchups');
  const matchups = readMatchups();
  res.json(matchups);
});

// Get a specific matchup by id
router.get('/:id', (req, res) => {
  debugApi('Fetching specific matchups', req.params.id, req.query);
  const matchups = readMatchups();
  const matchup = matchups.find(m => m.id === req.params.id);
  if (matchup) {
    res.json(matchup);
  } else {
    res.status(200).json({ message: 'Matchup not found' });
  }
});

// Create a new matchup
router.post('/', (req, res) => {
  debugApi('Create a new matchup');
  const matchups = readMatchups();
  const newMatchup = req.body;
  matchups.push(newMatchup);
  writeMatchups(matchups);
  res.status(201).json(newMatchup);
});

// Delete all matchups
router.delete('/delete', (req, res) => {
  debugApi('Delete all matchups');
  writeMatchups([]);
  res.status(204).send();
});

// Update a matchup's notes by id
router.patch('/:id/notes', (req, res) => {
  const { id } = req.params;
  debugApi(`Updating matchup with id ${id}`);
  const { notes } = req.body;
  const matchups = readMatchups();
  const matchupIndex = matchups.findIndex(m => m.id === id);
  if (matchupIndex !== -1) {
    matchups[matchupIndex].notes = notes;
    writeMatchups(matchups);
    res.json(matchups[matchupIndex]);
  } else {
    res.status(404).json({ error: 'Matchup not found' });
  }
});

export default router;
