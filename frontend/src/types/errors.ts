interface FetchBaseQueryErrorLike {
  status?: number;
  data?: unknown;
}

interface SerializedErrorLike {
  message?: string;
  name?: string;
}

const defaultErrorMessage = "Something went wrong";

const getErrorStringFromBody = (data: unknown): string | undefined => {
  if (data == null || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }
  const err = (data as { error: unknown }).error;
  return typeof err === "string" ? err : undefined;
}

/**
 * Returns a user-facing message for API/network errors from RTK Query or raw fetch.
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (error == null) {
    return defaultErrorMessage;
  }

  const withStatus = error as FetchBaseQueryErrorLike;

  if (typeof withStatus.status === "number") {
    const bodyError = getErrorStringFromBody(withStatus.data);

    if (withStatus.status === 404) {
      return bodyError ?? "Game not found";
    }

    if (withStatus.status === 400) {
      return bodyError ?? "Invalid move";
    }
    return bodyError ?? `Request failed (${withStatus.status})`;
  }

  const serialized = error as SerializedErrorLike;

  if (typeof serialized.message === "string" && !!serialized.message.length) {
    const m = serialized.message.toLowerCase();
    if (
      m.includes("fetch") ||
      m.includes("network") ||
      m.includes("failed to fetch")
    ) {
      return "Network error";
    }

    return serialized.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultErrorMessage;
}
