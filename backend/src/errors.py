class GameNotFound(Exception):
    def __init__(self, game_id: str, message: str | None = None):
        self.game_id = game_id
        super().__init__(message or f"Game not found: {game_id}")


class InvalidFlip(Exception):
    def __init__(self, message: str = "Invalid flip"):
        super().__init__(message)


class InvalidSettings(Exception):
    """Invalid game settings (e.g. odd card count, out-of-range values)."""
    def __init__(self, message: str = "Invalid settings"):
        super().__init__(message)
