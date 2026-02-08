from src.domain.game import (
    apply_countdown_if_expired,
    build_public_view,
    create_game,
    flip_card,
    restart_game,
)
from src.domain.types import PublicGameView, Settings
from src.errors import GameNotFound
from src.storage.repository import GameRepository


class GameService:
    def __init__(self, repository: GameRepository) -> None:
        self._repository = repository

    def create_game(
        self,
        game_id: str,
        settings: Settings,
        *,
        now: float | None = None,
    ) -> PublicGameView:
        """
        Validate, create session, save, return public view.
        Raises InvalidSettings if validation fails.
        """
        session = create_game(game_id, settings, now=now)
        self._repository.save(session)
        return build_public_view(session)

    def get_game(
        self,
        game_id: str,
        *,
        now: float | None = None,
    ) -> PublicGameView:
        """
        Load session; if missing raise GameNotFound.
        Apply countdown if expired (persist updated status), return public view.
        """
        session = self._repository.find_by_id(game_id)
        if session is None:
            raise GameNotFound(game_id)
        session = apply_countdown_if_expired(session, now=now)
        if session.status == "lost":
            self._repository.save(session)
        return build_public_view(session)

    def flip_card(
        self,
        game_id: str,
        card_id: str,
        *,
        now: float | None = None,
    ) -> PublicGameView:
        """
        Load session; if missing raise GameNotFound.
        Apply domain flip; on InvalidFlip let it propagate.
        Save updated session, return public view.
        """
        session = self._repository.find_by_id(game_id)
        if session is None:
            raise GameNotFound(game_id)
        updated, mismatch_pair = flip_card(session, card_id, now=now)
        self._repository.save(updated)
        reveal_emoji = dict(mismatch_pair) if mismatch_pair else None
        return build_public_view(updated, reveal_emoji=reveal_emoji)

    def restart_game(
        self,
        game_id: str,
        *,
        now: float | None = None,
    ) -> PublicGameView:
        """
        Load session; if missing raise GameNotFound.
        Domain restart (new board, reset state), save, return public view.
        """
        session = self._repository.find_by_id(game_id)
        if session is None:
            raise GameNotFound(game_id)
        updated = restart_game(session, now=now)
        self._repository.save(updated)
        return build_public_view(updated)

