// This file is used to handle all the websocket events that are sent by the league client
// WebSocketEvents

import ChampSelectSession from "./ChampSelectSession";
import Debug from "debug";
const debug = Debug("app:websocket-events");
Debug.enable("*");

export function setupWebSocketEventHandlers(ws, mainWindow) {
  let champSelectSession = null;
  let previousPickState = {
    championId: null,
    completed: false,
  };

  ws.subscribe("/lol-champ-select/v1/session", (event) => {
    if (event.eventType === "Create") {
      debug("Champ select session created.");
      champSelectSession = new ChampSelectSession(event);
      mainWindow.webContents.send(
        "champ-select-session-update",
        champSelectSession
      );
      mainWindow.webContents.send(
        "champ-select-phase-update",
        champSelectSession.getPhase()
      );
      return;
    }
    if (event.eventType === "Delete") {
      debug("Champ select session deleted.");
      champSelectSession = null;
      mainWindow.webContents.send("champ-select-session-update", null);
      mainWindow.webContents.send("champ-select-phase-update", null);
      return;
    }

    const oldSessionData = champSelectSession;
    const newSessionData = new ChampSelectSession(event);
    champSelectSession = newSessionData;

    mainWindow.webContents.send("champ-select-session-update", newSessionData);

    if (oldSessionData !== null) {
      if (newSessionData.getPhase() !== oldSessionData.getPhase()) {
        debug("Champ select phase updated:", newSessionData.getPhase());
        mainWindow.webContents.send(
          "champ-select-phase-update",
          newSessionData.getPhase()
        );
      }

      if (
        newSessionData.isBanPhase() &&
        oldSessionData.getPhase() === "PLANNING"
      ) {
        debug("Ban phase started.");
        mainWindow.webContents.send(
          "champ-select-local-player-ban-turn",
          newSessionData.ownBanActionId
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
        debug("Pick phase started.");
        mainWindow.webContents.send(
          "champ-select-local-player-pick-turn",
          newSessionData.ownPickActionId
        );
      }

      // Reflecting changes in champion picks
      reflectChampionPicksChanges(oldSessionData, newSessionData);

      function reflectChampionPicksChanges(oldSession, newSession) {
        const newLocalPlayerPickAction = newSession.getActionById(
          newSession.ownPickActionId
        );

        // Proceed only if there's a new pick action to consider
        if (newLocalPlayerPickAction) {
          const isChampionChange =
            previousPickState.championId !==
            newLocalPlayerPickAction.championId;
          const isCompletionChange =
            previousPickState.completed !== newLocalPlayerPickAction.completed;

          // Trigger events only if there's a change in champion selection or completion status
          if (isChampionChange || isCompletionChange) {
            if (newLocalPlayerPickAction.completed) {
              debug(
                "Local player has picked a champion:",
                newLocalPlayerPickAction
              );
              mainWindow.webContents.send(
                "champion-picked",
                newLocalPlayerPickAction.championId
              );
            } else {
              debug(
                "Local player is selecting a champion:",
                newLocalPlayerPickAction
              );
              mainWindow.webContents.send(
                "champion-selected",
                newLocalPlayerPickAction.championId
              );
            }

            // Update the previous state for the next comparison
            previousPickState = {
              championId: newLocalPlayerPickAction.championId,
              completed: newLocalPlayerPickAction.completed,
            };
          }
        }
      } // ...
    } else {
      mainWindow.webContents.send(
        "champ-select-phase-update",
        newSessionData.getPhase()
      );
    }
  });
}
