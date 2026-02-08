from typing import Protocol

from src.domain.types import GameSession


class GameRepository(Protocol):
    def save(self, session: GameSession) -> None:
        """Create or update a game session."""
        ...

    def find_by_id(self, game_id: str) -> GameSession | None:
        """Return the session for the given game_id, or None if not found."""
        ...

    def delete(self, game_id: str) -> None:
        """Remove the session for the given game_id (no-op if not present)."""
        ...
