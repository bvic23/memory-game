from src.domain.types import GameSession
from src.storage.repository import GameRepository


class MemoryGameRepository(GameRepository):
    """In-memory store for game sessions, keyed by game_id."""

    def __init__(self) -> None:
        self._store: dict[str, GameSession] = {}

    def save(self, session: GameSession) -> None:
        self._store[session.game_id] = session

    def find_by_id(self, game_id: str) -> GameSession | None:
        return self._store.get(game_id)

    def delete(self, game_id: str) -> None:
        self._store.pop(game_id, None)
