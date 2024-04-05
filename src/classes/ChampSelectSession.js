// src/classes/ChampSelectSession.js
export default class ChampSelectSession {
  constructor(data) {
    this.gameId = data.gameId;
    this.timer = data.timer;
    this.chatDetails = data.chatDetails;
    this.myTeam = data.myTeam;
    this.theirTeam = data.theirTeam;
    this.trades = data.trades;
    this.pickOrderSwaps = data.pickOrderSwaps;
    this.actions = data.actions;
    this.bans = data.bans;
    this.localPlayerCellId = data.localPlayerCellId;
    this.isSpectating = data.isSpectating;
    this.allowSkinSelection = data.allowSkinSelection;
    this.allowDuplicatePicks = data.allowDuplicatePicks;
    this.allowBattleBoost = data.allowBattleBoost;
    this.boostableSkinCount = data.boostableSkinCount;
    this.allowRerolling = data.allowRerolling;
    this.rerollsRemaining = data.rerollsRemaining;
    this.allowLockedEvents = data.allowLockedEvents;
    this.lockedEventIndex = data.lockedEventIndex;
    this.benchEnabled = data.benchEnabled;
    this.benchChampions = data.benchChampions;
    this.counter = data.counter;
    this.recoveryCounter = data.recoveryCounter;
    this.skipChampionSelect = data.skipChampionSelect;
    this.hasSimultaneousBans = data.hasSimultaneousBans;
    this.hasSimultaneousPicks = data.hasSimultaneousPicks;
    this.isCustomGame = data.isCustomGame;
    // Additional properties can be initialized here
  }

  getPickedChampionIds() {
    return this.myTeam
      .map((player) => player.championId)
      .filter((id) => id !== 0);
  }

  getLocalPlayer() {
    return this.myTeam.find(
      (player) => player.cellId === this.localPlayerCellId
    );
  }

  // Check if the local player has locked in their champion
  isLocalPlayerLockedIn() {
    const localPlayer = this.getLocalPlayer();
    return localPlayer && localPlayer.championId !== 0;
  }

  getMyTeamLockedInChampions() {
    return this.myTeam
      .filter((player) => player.championId !== 0)
      .map((player) => player.championId);
  }

  // Get locked-in champion IDs for the enemy team
  getTheirTeamLockedInChampions() {
    return this.theirTeam
      .filter((player) => player.championId !== 0)
      .map((player) => player.championId);
  }

  // Get the current champion selection state for both teams
  getChampionSelectionState() {
    const myTeamSelections = this.myTeam.map((player) => ({
      cellId: player.cellId,
      championId: player.championId,
      championPickIntent: player.championPickIntent,
    }));

    const theirTeamSelections = this.theirTeam.map((player) => ({
      cellId: player.cellId,
      championId: player.championId,
      // Pick intent is typically not available for the enemy team
    }));

    return { myTeamSelections, theirTeamSelections };
  }

  // Detect changes in the local player's pick intent or locked pick
  hasLocalPlayerPickChanged(oldSessionData) {
    const oldLocalPlayerData = oldSessionData.getLocalPlayer();
    const newLocalPlayerData = this.getLocalPlayer();
    return (
      !oldLocalPlayerData ||
      oldLocalPlayerData.championId !== newLocalPlayerData.championId ||
      oldLocalPlayerData.championPickIntent !==
        newLocalPlayerData.championPickIntent
    );
  }

  // Detect changes in the enemy team's locked picks
  haveTheirTeamPicksChanged(oldSessionData) {
    const oldEnemyChampionIds = oldSessionData
      .getTheirTeamLockedInChampions()
      .sort();
    const newEnemyChampionIds = this.getTheirTeamLockedInChampions().sort();
    return oldEnemyChampionIds.toString() !== newEnemyChampionIds.toString();
  }

  // Add more  methods as needed...
}
