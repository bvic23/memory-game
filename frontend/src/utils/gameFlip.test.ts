import {
  countMatchedPairs,
  executeFlip,
  hideCards,
  isMismatchedPair,
  FlipState,
  type FlipCardResponse,
  type FlipResultData,
} from "@/utils/gameFlip";
import type { Card as CardType } from "@/types/game";

const card = (id: string, overrides: Partial<CardType> = {}): CardType => ({ 
  id, 
  isFaceUp: false, 
  isMatched: false, 
  emoji: "🃏", 
  ...overrides 
});

describe("countMatchedPairs", () => {
  it("returns 0 when no cards are matched", () => {
    expect(countMatchedPairs([card("a"), card("b")])).toBe(0);
  });
  
  it("returns 1 when two cards are matched", () => {
    expect(countMatchedPairs([
      card("a", { isMatched: true }), 
      card("b", { isMatched: true })
    ])).toBe(1);
  });
  
  it("returns 2 when four cards are matched", () => {
    const board = ["a", "b", "c", "d"].map((id) => card(id, { isMatched: true }));
    expect(countMatchedPairs(board)).toBe(2);
  });
});

describe("hideCards", () => {
  it("sets isFaceUp false for non-matched cards", () => {
    const board = [
      card("a", { isFaceUp: true }),
      card("b", { isFaceUp: true }),
      card("c", { isFaceUp: false }),
    ];
    const result = hideCards(board);
    expect(result).toEqual([
      card("a", { isFaceUp: false }),
      card("b", { isFaceUp: false }),
      card("c", { isFaceUp: false }),
    ]);
  });

  it("keeps matched cards face-up", () => {
    const board = [
      card("a", { isMatched: true, isFaceUp: true }),
      card("b", { isFaceUp: true }),
    ];
    const result = hideCards(board);
    expect(result).toEqual([
      card("a", { isMatched: true, isFaceUp: true }),
      card("b", { isFaceUp: false }),
    ]);
  });

  it("returns new array and does not mutate original board", () => {
    const board = [card("a", { isFaceUp: true }), card("b")];
    const result = hideCards(board);
    expect(result).not.toBe(board);
    expect(board[0].isFaceUp).toBe(true);
  });

  it("returns empty array when board is empty", () => {
    expect(hideCards([])).toEqual([]);
  });
});

describe("isMismatchedPair", () => {
  it("returns true when matched count unchanged and both cards not matched", () => {
    const previousBoard = [card("a"), card("b"), card("c"), card("d")];
    const newBoard = [card("a"), card("b"), card("c"), card("d")];
    expect(isMismatchedPair("a", "b", newBoard, previousBoard)).toBe(true);
  });

  it("returns false when matched count increased (one pair matched in result)", () => {
    const previousBoard = [card("a"), card("b"), card("c"), card("d")];
    const newBoard = [
      card("a", { isMatched: true }),
      card("b", { isMatched: true }),
      card("c"),
      card("d"),
    ];
    expect(isMismatchedPair("a", "b", newBoard, previousBoard)).toBe(false);
  });

  it("returns false when only the first card is matched", () => {
    const previousBoard = [card("a"), card("b"), card("c"), card("d")];
    const newBoard = [
      card("a", { isMatched: true }),
      card("b"),
      card("c"),
      card("d"),
    ];
    expect(isMismatchedPair("a", "b", newBoard, previousBoard)).toBe(false);
  });

  it("returns false when only the second card is matched", () => {
    const previousBoard = [card("a"), card("b"), card("c"), card("d")];
    const newBoard = [
      card("a"),
      card("b", { isMatched: true }),
      card("c"),
      card("d"),
    ];
    expect(isMismatchedPair("a", "b", newBoard, previousBoard)).toBe(false);
  });

  it("returns false when result has more matched pairs than previous board", () => {
    const previousBoard = [
      card("a", { isMatched: true }),
      card("b", { isMatched: true }),
      card("c"),
      card("d"),
    ];
    const newBoard = [
      card("a", { isMatched: true }),
      card("b", { isMatched: true }),
      card("c", { isMatched: true }),
      card("d", { isMatched: true }),
    ];
    expect(isMismatchedPair("c", "d", newBoard, previousBoard)).toBe(false);
  });

  it("returns true when previous and result have same matched count (non-zero)", () => {
    const previousBoard = [
      card("a", { isMatched: true }),
      card("b", { isMatched: true }),
      card("c"),
      card("d"),
    ];
    const newBoard = [
      card("a", { isMatched: true }),
      card("b", { isMatched: true }),
      card("c"),
      card("d"),
    ];
    expect(isMismatchedPair("c", "d", newBoard, previousBoard)).toBe(true);
  });
});

describe("executeFlip", () => {
  it("returns error when API returns error", async () => {
    const board = [card("a"), card("b"), card("c"), card("d")];
    const flipCardApi = jest.fn().mockResolvedValue({
      error: { status: 400, data: { error: "Invalid move" } },
    });
    const result = await executeFlip(
      board,
      "a",
      flipCardApi as (id: string) => Promise<FlipCardResponse>,
    );
    expect(result).toEqual({ type: FlipState.Error, error: "Invalid move" });
  });

  it("returns done when API returns no data", async () => {
    const board = [card("a"), card("b"), card("c"), card("d")];
    const flipCardApi = jest.fn().mockResolvedValue({});
    const result = await executeFlip(
      board,
      "a",
      flipCardApi as (id: string) => Promise<FlipCardResponse>,
    );
    expect(result).toEqual({ type: FlipState.Done });
  });

  it("returns done when first card flip (no face-up cards)", async () => {
    const board = [card("a"), card("b"), card("c"), card("d")];
    const resultAfterFlip: FlipResultData = {
      gameId: "game-1",
      board: [
        card("a", { isFaceUp: true }),
        card("b"),
        card("c"),
        card("d"),
      ],
      state: { status: "playing", turns: 0, badGuesses: 0, remainingSeconds: 90, startedAt: 1000 },
    };
    const flipCardApi = jest.fn().mockResolvedValue({ data: resultAfterFlip });
    const result = await executeFlip(
      board,
      "a",
      flipCardApi as (id: string) => Promise<FlipCardResponse>,
    );
    expect(result).toEqual({ type: FlipState.Done });
  });

  it("returns done when second card matches (no mismatch)", async () => {
    const boardWithOneFaceUp = [
      card("a", { isFaceUp: true, emoji: "🍎" }),
      card("b", { emoji: "🍌" }),
      card("c"),
      card("d"),
    ];
    const resultAfterFlip: FlipResultData = {
      gameId: "game-1",
      board: [
        card("a", { isMatched: true, emoji: "🍎" }),
        card("b", { isMatched: true, emoji: "🍎" }),
        card("c"),
        card("d"),
      ],
      state: { status: "playing", turns: 1, badGuesses: 0, remainingSeconds: 90, startedAt: 1000 },
    };
    const flipCardApi = jest.fn().mockResolvedValue({ data: resultAfterFlip });
    const result = await executeFlip(
      boardWithOneFaceUp,
      "b",
      flipCardApi as (id: string) => Promise<FlipCardResponse>,
    );
    expect(result).toEqual({ type: FlipState.Done });
  });

  it("returns mismatch when second card is wrong", async () => {
    const boardWithOneFaceUp = [
      card("a", { isFaceUp: true, emoji: "🍎" }),
      card("b", { emoji: "🍌" }),
      card("c"),
      card("d"),
    ];
    const resultAfterFlip: FlipResultData = {
      gameId: "game-1",
      board: [
        card("a", { isFaceUp: false, emoji: "🍎" }),
        card("b", { isFaceUp: false, emoji: "🍌" }),
        card("c"),
        card("d"),
      ],
      state: { status: "playing", turns: 1, badGuesses: 1, remainingSeconds: 90, startedAt: 1000 },
    };
    const flipCardApi = jest.fn().mockResolvedValue({ data: resultAfterFlip });
    const result = await executeFlip(
      boardWithOneFaceUp,
      "b",
      flipCardApi as (id: string) => Promise<FlipCardResponse>,
    );
    expect(result.type).toBe(FlipState.Mismatch);
    if (result.type === FlipState.Mismatch) {
      expect(result.board).toHaveLength(4);
      const aCard = result.board.find((c) => c.id === "a");
      const bCard = result.board.find((c) => c.id === "b");
      expect(aCard?.isFaceUp).toBe(false);
      expect(bCard?.isFaceUp).toBe(false);
    }
  });

  it("returns error when API throws", async () => {
    const board = [card("a"), card("b"), card("c"), card("d")];
    const flipCardApi = jest.fn().mockRejectedValue(new Error("Network error"));
    const result = await executeFlip(
      board,
      "a",
      flipCardApi as (id: string) => Promise<FlipCardResponse>,
    );
    expect(result).toEqual({ type: FlipState.Error, error: "Network error" });
  });

  it("calls flipCardApi with correct cardId", async () => {
    const board = [card("a"), card("b"), card("c"), card("d")];
    const flipCardApi = jest.fn().mockResolvedValue({});
    await executeFlip(
      board,
      "test-card-id",
      flipCardApi as (id: string) => Promise<FlipCardResponse>,
    );
    expect(flipCardApi).toHaveBeenCalledWith("test-card-id");
    expect(flipCardApi).toHaveBeenCalledTimes(1);
  });
});
