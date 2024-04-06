import EventEmitter from "events";
import ChampSelectSession from "./ChampSelectSession";
import Debug from "debug";
const debug = Debug("app:websocket-events");
Debug.enable("*");

class WebSocketEventHandlers extends EventEmitter {
  constructor(mainWindow) {
    super();
    this.mainWindow = mainWindow;
    this.champSelectSession = null;
    this.previousPickState = {
      championId: null,
      completed: false,
    };
  }

  setup(ws) {
    debug("Setting up WebSocket event handlers.");
    ws.subscribe("/lol-champ-select/v1/session", (event) =>
      this.handleEvent(event)
    );
  }

  handleEvent(event) {
    switch (event.eventType) {
      case "Create":
        this.handleCreate(event);
        break;
      case "Delete":
        this.handleDelete();
        break;
      default:
        this.handleUpdate(event);
        break;
    }
  }

  handleCreate(event) {
    debug("Champ select session created.");
    this.champSelectSession = new ChampSelectSession(event);
    // this.sendToMainWindow(
    //   "champ-select-session-update",
    //   this.champSelectSession
    // );
    // this.sendToMainWindow(
    //   "champ-select-phase-update",
    //   this.champSelectSession.getPhase()
    // );
  }

  handleDelete() {
    debug("Champ select session deleted.");
    this.champSelectSession = null;
    this.sendToMainWindow("champ-select-session-update", null);
    this.sendToMainWindow("champ-select-phase-update", null);
  }

  handleUpdate(event) {
    const oldSessionData = this.champSelectSession;
    const newSessionData = new ChampSelectSession(event);
    this.champSelectSession = newSessionData;

    // this.sendToMainWindow("champ-select-session-update", newSessionData);

    if (oldSessionData !== null) {
      if (newSessionData.getPhase() !== oldSessionData.getPhase()) {
        debug("1 Champ select phase updated:", newSessionData.getPhase());
        this.sendToMainWindow(
          "champ-select-phase-update",
          newSessionData.getPhase()
        );
      }
      if (
        newSessionData.inProgressActionIds.includes(
          newSessionData.ownPickActionId
        ) &&
        !oldSessionData.inProgressActionIds.includes(
          newSessionData.ownPickActionId
        )
      ) {
        if (newSessionData.isLocalPlayerTurn()) {
          debug("Pick phase started for local player");
          this.sendToMainWindow(
            "champ-select-local-player-pick-turn",
            newSessionData.ownPickActionId
          );
        }
      }
      this.reflectChanges(oldSessionData, newSessionData);
    } else {
      debug("oldSessionData null", oldSessionData);
    }
  }

  reflectChanges(oldSessionData, newSessionData) {
    if (
      !oldSessionData.isLocalPlayerTurn() &&
      newSessionData.isLocalPlayerTurn()
    ) {
      console.log("It's now the local player's turn.");
    }

    if (
      newSessionData.isLocalPlayerTurn() ||
      newSessionData.isLocalPlayerTurnCompleted()
    ) {
      this.handlePlayerPickChanges(oldSessionData, newSessionData);
    }

    if (newSessionData.isEnemyTurn()) {
      console.log("It's now the enemy's turn.");
      this.handleEnemyChampionLocks(oldSessionData, newSessionData);
    }
  }

  handleEnemyChampionLocks(oldSessionData, newSessionData) {
    const oldEnemyPicks = oldSessionData.getLockedInChampions(false);
    const newEnemyPicks = newSessionData.getLockedInChampions(false);
    debug("newEnemyPicks enemy picks:", newEnemyPicks);
    const newlyLockedInEnemies = newEnemyPicks.filter(
      (newPick) =>
        !oldEnemyPicks.some(
          (oldPick) => newPick.championId === oldPick.championId
        )
    );

    newlyLockedInEnemies.forEach((enemyPick) => {
      debug(`Enemy has locked in champion: ${enemyPick.championId}`);
      this.sendToMainWindow("enemy-champion-locked", enemyPick.championId);
    });
  }

  getLockedInEnemyPicks(sessionData) {
    // Return an array of enemy picks where championId is greater than 0
    return sessionData.theirTeam
      .filter((member) => member.championId > 0)
      .map((member) => ({ championId: member.championId }));
  }

  handlePlayerPickChanges(oldSessionData, newSessionData) {
    const newLocalPlayerPickAction = newSessionData.getActionById(
      newSessionData.ownPickActionId
    );
    if (newLocalPlayerPickAction) {
      const isChampionChange =
        this.previousPickState.championId !==
        newLocalPlayerPickAction.championId;
      const isCompletionChange =
        this.previousPickState.completed !== newLocalPlayerPickAction.completed;
      debug("completed", newLocalPlayerPickAction.completed);
      if (isChampionChange || isCompletionChange) {
        if (newLocalPlayerPickAction.completed) {
          debug(
            "Local player has picked a champion:",
            newLocalPlayerPickAction
          );
          this.sendToMainWindow(
            "champion-picked",
            newLocalPlayerPickAction.championId
          );
        } else {
          debug(
            "Local player is selecting a champion:",
            newLocalPlayerPickAction
          );
          this.sendToMainWindow(
            "champion-selected",
            newLocalPlayerPickAction.championId
          );
        }

        this.previousPickState = {
          championId: newLocalPlayerPickAction.championId,
          completed: newLocalPlayerPickAction.completed,
        };
      }
    }
  }

  sendToMainWindow(channel, data) {
    this.mainWindow.webContents.send(channel, data);
  }
}

export default WebSocketEventHandlers;
