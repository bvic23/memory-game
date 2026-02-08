import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Game } from "@/types/game";
import type { CreateGameRequest } from "@/types/requests";
import { apiBaseUrl } from "@/utils/urls";

const baseUrl = apiBaseUrl();

export const gamesApi = createApi({
  reducerPath: "gamesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Game"],
  endpoints: (builder) => ({
    createGame: builder.mutation<Game, CreateGameRequest>({
      query: (body) => ({
        url: "/games",
        method: "POST",
        body,
      }),
      invalidatesTags: () => [{ type: "Game", id: "LIST" }],
    }),
    getGame: builder.query<Game, string>({
      query: (gameId) => `/games/${encodeURIComponent(gameId)}`,
      providesTags: (_result, _error, gameId) => [{ type: "Game", id: gameId }],
    }),
    flipCard: builder.mutation<
      Omit<Game, "settings">,
      { gameId: string; cardId: string }
    >({
      query: ({ gameId, cardId }) => ({
        url: `/games/${encodeURIComponent(gameId)}/flip`,
        method: "POST",
        body: { cardId },
      }),
      async onQueryStarted({ gameId, cardId }, { dispatch, queryFulfilled }) {
        // Optimistically flip the card
        const patchResult = dispatch(
          gamesApi.util.updateQueryData("getGame", gameId, (draft) => {
            const card = draft.board.find((c) => c.id === cardId);
            if (card) {
              card.isFaceUp = true;
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          // Flip response has no settings; merge with cached game to keep settings.
          dispatch(
            gamesApi.util.updateQueryData("getGame", gameId, (draft) => ({
              ...data,
              settings: draft.settings,
            })),
          );
        } catch {
          // Roll back the optimistic update on error
          patchResult.undo();
        }
      },
    }),
    restartGame: builder.mutation<Game, string>({
      query: (gameId) => ({
        url: `/games/${encodeURIComponent(gameId)}/restart`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, gameId) => [
        { type: "Game", id: gameId },
      ],
    }),
  }),
});

export const {
  useCreateGameMutation,
  useGetGameQuery,
  useFlipCardMutation,
  useRestartGameMutation,
} = gamesApi;
