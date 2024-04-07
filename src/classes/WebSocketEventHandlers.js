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

    this.sendToMainWindow("champ-select-session-update", newSessionData);

    if (oldSessionData !== null) {
      if (newSessionData.getPhase() !== oldSessionData.getPhase()) {
        debug("1 Champ select phase updated:", newSessionData.getPhase());
        this.sendToMainWindow("champ-select-phase-update", {
          phase: newSessionData.getPhase(),
          timeLeft: newSessionData.timer.adjustedTimeLeftInPhase || 0,
        });
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
            newSessionData.timer.adjustedTimeLeftInPhase
          );
        }
      }
      this.reflectChanges(oldSessionData, newSessionData);
    } else {
      // debug("oldSessionData null", oldSessionData);
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

    const oldPicks = [
      ...oldSessionData.getLockedInChampions(true),
      ...oldSessionData.getLockedInChampions(false),
    ];
    const newPicks = [
      ...newSessionData.getLockedInChampions(true),
      ...newSessionData.getLockedInChampions(false),
    ];

    const newlyLockedInChampions = newPicks.filter(
      (newPick) => !oldPicks.includes(newPick)
    );

    if (newlyLockedInChampions.length > 0) {
      debug("Newly locked in champions:", newlyLockedInChampions);
      debug("My team:", newSessionData.myTeam);
      debug("Their team:", newSessionData.theirTeam);
      this.sendToMainWindow("champ-select-team-picks-update", {
        myTeam: newSessionData.myTeam,
        theirTeam: newSessionData.theirTeam,
      });
    }
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
      // debug("completed", newLocalPlayerPickAction.completed);
      if (isChampionChange || isCompletionChange) {
        if (newLocalPlayerPickAction.completed) {
          debug(
            "Local player has picked a champion:",
            newLocalPlayerPickAction
          );
          this.sendToMainWindow(
            "champ-select-local-player-pick-turn",
            newSessionData.timer.adjustedTimeLeftInPhase
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
