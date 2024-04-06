// src/classes/ChampSelectSession.js
import Debug from "debug";
const debug = Debug("app:champ-select-session");
Debug.enable("*");

export default class ChampSelectSession {
  constructor(data) {
    this.ownBanActionId = -1;
    this.ownPickActionId = -1;
    this.inProgressActionIds = [];

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

    for (let actionGroup of this.actions)
      for (let action of actionGroup) {
        if (action.isInProgress) this.inProgressActionIds.push(action.id);
        if (action.actorCellId === data.localPlayerCellId) {
          if (action.type === "ban") {
            this.ownBanActionId = action.id;
          } else if (action.type === "pick") {
            this.ownPickActionId = action.id;
          }
        }
      }
  }

  findOwnActionId(actionType) {
    for (let actionGroup of this.actions) {
      for (let action of actionGroup) {
        if (
          action.actorCellId === this.localPlayerCellId &&
          action.type === actionType
        ) {
          return action.id;
        }
      }
    }
    return -1;
  }

  findInProgressActionIds() {
    let ids = [];
    for (let actionGroup of this.actions) {
      for (let action of actionGroup) {
        if (action.isInProgress) {
          ids.push(action.id);
        }
      }
    }
    return ids;
  }

  getActionById(id) {
    for (let actionGroup of this.actions) {
      for (let action of actionGroup) {
        if (action.id === id) {
          return action;
        }
      }
    }
    return null;
  }

  getLocalPlayer() {
    return this.myTeam.find(
      (player) => player.cellId === this.localPlayerCellId
    );
  }

  getPhase() {
    // 'PLANNING' | 'BAN_PICK' | 'FINALIZATION' | ''
    switch (this.timer.phase) {
      case "PLANNING":
        return "PLANNING";
      case "BAN_PICK":
        return "BAN_PICK";
      case "FINALIZATION":
        return "FINALIZATION";
      case '':
        return '';
    }
  }

  isBanPhase() {
    return this.actions
      .flat()
      .some((action) => action.type === "BAN" && !action?.completed);
  }

  isPickPhase() {
    return this.actions
      .flat()
      .some((action) => action.type === "PICK" && !action?.completed);
  }

  isEnemyTurn() {
    return this.actions
      .flat()
      .some(
        (action) =>
          action.isInProgress &&
          !action.isAllyAction &&
          action.actorCellId !== this.localPlayerCellId
      );
  }

  isLocalPlayerTurn() {
    return this.actions
      .flat()
      .some(
        (action) =>
          action.actorCellId === this.localPlayerCellId && action.isInProgress
      );
  }

  isLocalPlayerTurnCompleted() {
    return this.actions
      .flat()
      .some(
        (action) =>
          action.actorCellId === this.localPlayerCellId &&
          !action.isInProgress &&
          action.completed
      );
  }

  getLockedInChampions(isAlly = true) {
    const team = isAlly ? this.myTeam : this.theirTeam;
    return team
      .filter((member) => member.championId > 0)
      .map((member) => member.championId);
  }

  // Add other methods as needed based on the functionalities you wish to implement.
}
