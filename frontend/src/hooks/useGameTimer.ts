import { useState, useEffect, useRef } from "react";
import type { GameStatus } from "@/types/game";
import { getGameTimerWsUrl } from "@/utils/urls";

const VALID_STATUSES = ["playing", "won", "lost"] as const;

const isGameStatus = (value: unknown): value is GameStatus =>
  VALID_STATUSES.includes(value as GameStatus);


const parseTimerMessage = (payload: string): TimerUpdate | null => {
  let data: unknown;

  try {
    data = JSON.parse(payload);
  } catch (error) {
    console.error("WebSocket error:", error);
    return null;
  }

  if (typeof data !== "object" || data === null) {
    console.error("WebSocket error: invalid message payload");
    return null;
  }

  if ("error" in data) {
    console.error("WS error message:", data.error);
    return null;
  }

  const { remainingSeconds, status } = data as {
    remainingSeconds?: unknown;
    status?: unknown;
  };

  const parsedRemainingSeconds = Number(remainingSeconds);
  if (!Number.isFinite(parsedRemainingSeconds) || !isGameStatus(status)) {
    console.error("WebSocket error: invalid timer payload");
    return null;
  }

  return {
    displayedSeconds: Math.max(0, parsedRemainingSeconds),
    status,
  };
};

export interface TimerUpdate {
  displayedSeconds: number;
  status: GameStatus;
}

export function useGameTimer(
  gameId: string,
  onGameEnd: () => void,
  // sessionKey is for identifying new game session, which means new ws connection
  sessionKey: number,
): TimerUpdate | null {
  const [update, setUpdate] = useState<TimerUpdate | null>(null);
  const onGameEndRef = useRef(onGameEnd);

  useEffect(() => {
    onGameEndRef.current = onGameEnd;
  }, [onGameEnd]);

  useEffect(() => {
    const url = getGameTimerWsUrl(gameId);

    let isActive = true;
    let ws: WebSocket | null = null;

    const safeSetUpdate = (nextUpdate: TimerUpdate | null) => {
      if (!isActive) return;
      setUpdate(nextUpdate);
    };

    const createWebSocket = () => {
      if (!isActive) {
        return;
      }

      ws = new WebSocket(url);

      ws.onmessage = (event) => {
        const nextUpdate = parseTimerMessage(event.data as string);
        if (!nextUpdate) {
          return;
        }

        safeSetUpdate(nextUpdate);

        if (nextUpdate.status !== "playing") {
          onGameEndRef.current?.();
        }
      };

      ws.onerror = () => {
        safeSetUpdate(null);
      };

      ws.onclose = () => {
        ws = null;
        safeSetUpdate(null);
      };
    };

    // Defer creating the WebSocket so React Strict Mode's initial mount cleanup
    // runs first; otherwise we close the socket before it connects and the
    const id = setTimeout(createWebSocket, 0);

    return () => {
      isActive = false;
      clearTimeout(id);
      if (ws) {
        ws.close();
        ws = null;
      }
      setUpdate(null);
    };
  }, [gameId, sessionKey]);

  return update;
}
