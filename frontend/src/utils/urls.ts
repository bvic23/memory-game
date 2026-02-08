export function apiBaseUrl(): string {
  const url = import.meta.env.VITE_BACKEND_URL;
  if (!url || url.trim().length === 0) {
    throw new Error("VITE_BACKEND_URL is not set");
  }
  return `${url}/api`;
};

export function getWebSocketBaseUrl(): string {
  const url = apiBaseUrl();

  // TODO: if https, use wss
  if (url.startsWith("http://")) {
    return "ws://" + url.slice(7);
  }
  return url;
}

export const getGameTimerWsUrl = (gameId: string): string =>
  `${getWebSocketBaseUrl()}/games/${encodeURIComponent(gameId)}/timer`;
