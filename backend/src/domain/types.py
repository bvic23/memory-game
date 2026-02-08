from dataclasses import dataclass, field
from typing import Literal


# --- Internal ---


@dataclass(frozen=True)
class InternalCard:
    """Server-only card: id and true emoji for matching."""
    id: str
    emoji: str


@dataclass
class Settings:
    """Game settings."""
    user_name: str
    card_count: int
    countdown_seconds: int
    flip_back_delay_ms: int
    max_bad_guesses: int | None = None


GameStatus = Literal["playing", "won", "lost"]


@dataclass
class GameSession:
    """Internal game session: full state for domain logic."""
    game_id: str
    user_name: str
    settings: Settings
    board: list[InternalCard]
    status: GameStatus
    started_at: float  # Unix timestamp
    turns: int
    bad_guesses: int
    flipped_card_ids: list[str]  # 0, 1, or 2 ids currently face-up this turn
    matched_card_ids: set[str] = field(default_factory=set)


# --- Public ---


@dataclass
class PublicCard:
    """Public card: emoji only when is_face_up or is_matched."""
    id: str
    is_face_up: bool
    is_matched: bool
    emoji: str | None = None


@dataclass
class GameState:
    """Public game state (stats + timer). Matched count is derived from board (is_matched)."""
    status: GameStatus
    turns: int
    bad_guesses: int
    started_at: float
    countdown_seconds: int
    remaining_seconds: int

    @classmethod
    def from_session(cls, session: "GameSession", remaining_seconds: int) -> "GameState":
        """Build public state from a session and computed remaining time."""
        return cls(
            status=session.status,
            turns=session.turns,
            bad_guesses=session.bad_guesses,
            started_at=session.started_at,
            countdown_seconds=session.settings.countdown_seconds,
            remaining_seconds=remaining_seconds,
        )


@dataclass
class PublicGameView:
    game_id: str
    board: list[PublicCard]
    settings: Settings
    state: GameState
