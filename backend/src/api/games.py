import asyncio
import uuid

from fastapi import APIRouter, Depends, status, WebSocket, WebSocketDisconnect

from src.api.schemas import (
    CreateGameRequest,
    FlipRequest,
    FlipResponse,
    GameResponse,
    build_flip_response,
    build_response,
)
from src.deps import get_game_service
from src.domain.types import Settings
from src.errors import GameNotFound
from src.services.game import GameService

router = APIRouter(prefix="/games", tags=["Games"])

@router.post(
    "",
    response_model=GameResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new game",
)
def create_game(
    body: CreateGameRequest,
    game_service: GameService = Depends(get_game_service),
) -> GameResponse:
    """Create a new game with the given settings. Returns 201 with the public game view."""
    game_id = str(uuid.uuid4())
    settings = Settings(
        user_name=body.user_name,
        card_count=body.card_count,
        countdown_seconds=body.countdown_seconds,
        flip_back_delay_ms=body.flip_back_delay_ms,
        max_bad_guesses=body.max_bad_guesses,
    )
    view = game_service.create_game(game_id, settings)
    return build_response(view)


@router.get(
    "/{game_id}",
    response_model=GameResponse,
    summary="Get game state",
)
def get_game(
    game_id: str,
    game_service: GameService = Depends(get_game_service),
) -> GameResponse:
    """Return the public state of the game. 404 if not found."""
    view = game_service.get_game(game_id)
    return build_response(view)


@router.post(
    "/{game_id}/flip",
    response_model=FlipResponse,
    summary="Flip a card",
)
def flip_card(
    game_id: str,
    body: FlipRequest,
    game_service: GameService = Depends(get_game_service),
) -> FlipResponse:
    """Flip a card by id. 400/409 on invalid flip, 404 if game not found."""
    view = game_service.flip_card(game_id, body.card_id)
    return build_flip_response(view)


@router.post(
    "/{game_id}/restart",
    response_model=GameResponse,
    summary="Restart the game",
)
def restart_game(
    game_id: str,
    game_service: GameService = Depends(get_game_service),
) -> GameResponse:
    """Restart the game (same id, new board and state). 404 if not found."""
    view = game_service.restart_game(game_id)
    return build_response(view)


@router.websocket("/{game_id}/timer")
async def game_timer_websocket(
    websocket: WebSocket,
    game_id: str,
    game_service: GameService = Depends(get_game_service),
) -> None:
    """
    Push timer updates every second while the game is playing.
    Sends JSON: { "remainingSeconds": int, "status": "playing"|"won"|"lost" }.
    When status is not "playing", sends one final message and closes.
    On game not found, sends { "error": "NOT_FOUND" } and closes.
    """
    await websocket.accept()
    try:
        game_service.get_game(game_id)
    except GameNotFound:
        await websocket.send_json({"error": "NOT_FOUND"})
        await websocket.close()
        return

    try:
        while True:
            view = game_service.get_game(game_id)
            state = view.state
            await websocket.send_json(
                {
                    "remainingSeconds": state.remaining_seconds,
                    "status": state.status,
                }
            )
            if state.status != "playing":
                break
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass

