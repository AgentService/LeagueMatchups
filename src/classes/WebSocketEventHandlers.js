import EventEmitter from "events";
import ChampSelectSession from "./ChampSelectSession";
import Debug from "debug";

const { authenticate } = require("league-connect");
import fetch from "node-fetch";  // Use a static import for consistency

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

    // Subscribe to gameflow phase events for end of game
    ws.subscribe("/lol-gameflow/v1/gameflow-phase", (event) =>
      this.handleGameflowPhaseEvent(event)
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
        debug("Champ select phase updated:", newSessionData.getPhase());
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
    }
  }

  handleGameflowPhaseEvent(event) {
    debug("Gameflow phase event received:", event);

    const currentPhase = event;
    this.sendToMainWindow("gameflow-phase-change", currentPhase);

    console.log(`Gameflow phase updated: ${currentPhase}`);

    switch (currentPhase) {
      case "EndOfGame":
        console.log("Game has ended.");
        this.sendToMainWindow("game-end-event"); // Only trigger on EndOfGame
        this.fetchPostGameData(); // Only fetch post-game data on EndOfGame
        break;
      case "InProgress":
        console.log("Game has started.");
        this.sendToMainWindow("game-start-event");
        break;
      case "WaitingForStats":
        console.log("Waiting for stats...");
        break;
      case "TerminatedInError":
        console.log("Game terminated in error.");
        break;
      case "Lobby":
        console.log("In lobby phase, no game in progress.");
        // this.fetchPostGameData(); // Only fetch post-game data on EndOfGame
        break;
      case "None":
        console.log("No active game session.");
        break;
      default:
        console.log(`Unhandled phase: ${currentPhase}`);
        break;
    }
  }


  async fetchPostGameData() {
    try {
      const endpoint = "/lol-match-history/v1/products/lol/current-summoner/matches";
      debug("Fetching match history from endpoint:", endpoint);

      const matchHistoryData = await this.fetchFromApi(endpoint);
      // debug("Match history data received:", matchHistoryData);

      if (matchHistoryData && matchHistoryData.games && matchHistoryData.games.games.length > 0) {
        // Loop through the first 10 games and log their gameMode and gameType
        for (let i = 0; i < Math.min(10, matchHistoryData.games.games.length); i++) {
          const game = matchHistoryData.games.games[i];
          // debug(`Game ${i + 1}: gameMode = ${game.gameMode}, gameType = ${game.gameType}`);
        }

        // Update the filtering logic to check for ranked games in Classic mode
        const validGames = matchHistoryData.games.games.filter(game =>
          game.endOfGameResult !== "Abort_TooFewPlayers" &&
          game.gameMode === "CLASSIC" &&
          (game.queueId === 420) // Check for ranked queues
        );
        // debug("Filtered valid ranked games:", validGames);

        if (validGames.length > 0) {
          const mostRecentGame = validGames[0];
          this.sendToMainWindow("post-game-stats", mostRecentGame);
          debug("Sent post-game stats to main window for game:", mostRecentGame.gameId);
        } else {
          console.log("No valid completed ranked games found.");
          debug("No valid ranked games found after filtering.");
        }
      } else {
        console.log("No game data available.");
        debug("Match history data is empty or does not contain any games.");
      }
    } catch (error) {
      console.error("Error fetching post-game stats:", error);
      debug("Error occurred during fetchPostGameData execution:", error);
    }
  }

  async fetchFromApi(endpoint) {
    const credentials = await authenticate({ awaitConnection: false });
    const { port, password } = credentials; // Ensure you have credentials available
    const url = `https://127.0.0.1:${port}${endpoint}`;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${password}`).toString("base64")}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error during API fetch:", error);
      throw error; // Ensure the error is propagated for further handling
    } finally {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
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
