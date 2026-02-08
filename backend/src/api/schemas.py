from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict, Field

from src.domain.constants import (
    CARD_COUNT_MAX,
    CARD_COUNT_MIN,
    COUNTDOWN_SECONDS_MAX,
    COUNTDOWN_SECONDS_MIN,
)

if TYPE_CHECKING:
    from src.domain.types import PublicGameView

# --- Requests ---

class CreateGameRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_name: str = Field(..., alias="userName", min_length=1)
    card_count: int = Field(
        ..., alias="cardCount", ge=CARD_COUNT_MIN, le=CARD_COUNT_MAX
    )
    countdown_seconds: int = Field(
        ..., alias="countdownSeconds", ge=COUNTDOWN_SECONDS_MIN, le=COUNTDOWN_SECONDS_MAX
    )
    flip_back_delay_ms: int = Field(..., alias="flipBackDelayMs", ge=0)
    max_bad_guesses: int | None = Field(None, alias="maxBadGuesses", gt=0)


class FlipRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    card_id: str = Field(..., alias="cardId", min_length=1)

# --- Responses ---

class PublicCardResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    id: str
    is_face_up: bool = Field(..., alias="isFaceUp")
    is_matched: bool = Field(..., alias="isMatched")
    emoji: str | None = None


class SettingsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    user_name: str = Field(..., alias="userName")
    card_count: int = Field(..., alias="cardCount")
    countdown_seconds: int = Field(..., alias="countdownSeconds")
    flip_back_delay_ms: int = Field(..., alias="flipBackDelayMs")
    max_bad_guesses: int | None = Field(None, alias="maxBadGuesses")


class GameStateResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    status: str
    turns: int
    bad_guesses: int = Field(..., alias="badGuesses")
    started_at: float = Field(..., alias="startedAt")
    remaining_seconds: int = Field(..., alias="remainingSeconds")


class GameResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    game_id: str = Field(..., alias="gameId")
    board: list[PublicCardResponse]
    settings: SettingsResponse
    state: GameStateResponse


class FlipResponse(BaseModel):
    """Game state after a flip, without settings (client already has them)."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    game_id: str = Field(..., alias="gameId")
    board: list[PublicCardResponse]
    state: GameStateResponse

# --- Error response ---

class ErrorResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    error: str
    code: str


def build_response(view: "PublicGameView") -> GameResponse:
    cards = [
        PublicCardResponse(
            id=c.id,
            is_face_up=c.is_face_up,
            is_matched=c.is_matched,
            emoji=c.emoji,
        )
        for c in view.board
    ]
    settings = SettingsResponse(
        user_name=view.settings.user_name,
        card_count=view.settings.card_count,
        countdown_seconds=view.settings.countdown_seconds,
        flip_back_delay_ms=view.settings.flip_back_delay_ms,
        max_bad_guesses=view.settings.max_bad_guesses,
    )
    state = GameStateResponse(
        status=view.state.status,
        turns=view.state.turns,
        bad_guesses=view.state.bad_guesses,
        started_at=view.state.started_at,
        remaining_seconds=view.state.remaining_seconds,
    )
    return GameResponse(
        game_id=view.game_id,
        board=cards,
        settings=settings,
        state=state,
    )


def build_flip_response(view: "PublicGameView") -> "FlipResponse":
    cards = [
        PublicCardResponse(
            id=c.id,
            is_face_up=c.is_face_up,
            is_matched=c.is_matched,
            emoji=c.emoji,
        )
        for c in view.board
    ]
    state = GameStateResponse(
        status=view.state.status,
        turns=view.state.turns,
        bad_guesses=view.state.bad_guesses,
        started_at=view.state.started_at,
        remaining_seconds=view.state.remaining_seconds,
    )
    return FlipResponse(game_id=view.game_id, board=cards, state=state)
