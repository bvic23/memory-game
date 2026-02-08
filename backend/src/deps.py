from src.services.game import GameService
from src.storage.memory import MemoryGameRepository

_repository = MemoryGameRepository()
_game_service = GameService(_repository)


def get_game_service() -> GameService:
    return _game_service
