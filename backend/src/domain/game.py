import random
import time
from dataclasses import replace

from src.domain.constants import (
    CARD_COUNT_MAX,
    CARD_COUNT_MIN,
    COUNTDOWN_SECONDS_MAX,
    COUNTDOWN_SECONDS_MIN,
    EMOJI_SET,
)
from src.domain.types import (
    GameSession,
    GameState,
    GameStatus,
    InternalCard,
    PublicCard,
    PublicGameView,
    Settings,
)
from src.errors import InvalidFlip, InvalidSettings


def _validate_settings(settings: Settings) -> None:
    if not (settings.user_name and settings.user_name.strip()):
        raise InvalidSettings("user_name must be non-empty")
    if settings.card_count % 2 != 0:
        raise InvalidSettings("card_count must be even")

    if not (CARD_COUNT_MIN <= settings.card_count <= CARD_COUNT_MAX):
        raise InvalidSettings(
            f"card_count must be between {CARD_COUNT_MIN} and {CARD_COUNT_MAX}"
        )
    
    if not (COUNTDOWN_SECONDS_MIN <= settings.countdown_seconds <= COUNTDOWN_SECONDS_MAX):
        raise InvalidSettings(
            f"countdown_seconds must be between {COUNTDOWN_SECONDS_MIN} and {COUNTDOWN_SECONDS_MAX}"
        )
        
    if settings.flip_back_delay_ms < 0:
        raise InvalidSettings("flip_back_delay_ms must be non-negative")
    
    if settings.max_bad_guesses is not None and settings.max_bad_guesses < 1:
        raise InvalidSettings("max_bad_guesses must be positive when set")


def _build_board(settings: Settings) -> list[InternalCard]:
    """Generate card_count/2 emojis (reusing from set if needed)"""
    n_pairs = settings.card_count // 2
    chosen = random.choices(EMOJI_SET, k=n_pairs)
    emojis = chosen + chosen
    random.shuffle(emojis)
    return [
        InternalCard(id=f"card-{i}", emoji=emoji)
        for i, emoji in enumerate(emojis)
    ]


def create_game(
    game_id: str,
    settings: Settings,
    *,
    now: float | None = None,
) -> GameSession:
    """
    Validate settings, generate board, create session.
    """
    _validate_settings(settings)
    board = _build_board(settings)
    if now is None:
        now = time.time()
    return GameSession(
        game_id=game_id,
        user_name=settings.user_name,
        settings=settings,
        board=board,
        status="playing",
        started_at=now,
        turns=0,
        bad_guesses=0,
        flipped_card_ids=[],
        matched_card_ids=set(),
    )


def get_remaining_seconds(session: GameSession, now: float | None = None) -> int:
    """
    Remaining time = max(0, countdown_seconds - elapsed).
    """
    if now is None:
        now = time.time()
    elapsed = now - session.started_at
    remaining = session.settings.countdown_seconds - int(elapsed)
    return max(0, remaining)


def apply_countdown_if_expired(
    session: GameSession,
    now: float | None = None,
) -> GameSession:
    """
    If status is still "playing" and remaining time <= 0, set status to "lost".
    """
    if session.status != "playing":
        return session

    if now is None:
        now = time.time()

    remaining = get_remaining_seconds(session, now)

    if remaining <= 0:
        return replace(session, status = "lost")

    return session


def _card_by_id(session: GameSession, card_id: str) -> InternalCard | None:
    for c in session.board:
        if c.id == card_id:
            return c
    return None


def flip_card(
    session: GameSession,
    card_id: str,
    now: float | None = None,
) -> tuple[GameSession, list[tuple[str, str]] | None]:
    """
    Apply one flip. Validates: game playing, card exists, not already flipped/matched,
    not already two flipped. On second flip: resolve match/mismatch, update stats,
    check countdown and maxBadGuesses, set won/lost if needed.
    Returns (updated_session, mismatch_pair). mismatch_pair is [(card_id, emoji), (card_id, emoji)]
    for the two flipped cards when it was a mismatch (so view can reveal their emojis in the board); None otherwise.
    """
    if session.status != "playing":
        raise InvalidFlip("Game is not in progress")

    card = _card_by_id(session, card_id)

    if card is None:
        raise InvalidFlip("Card not found")
    
    if card_id in session.matched_card_ids:
        raise InvalidFlip("Card is already matched")
    
    if card_id in session.flipped_card_ids:
        raise InvalidFlip("Card is already face-up")
    
    if len(session.flipped_card_ids) >= 2:
        raise InvalidFlip("Already two cards face-up this turn")

    if now is None:
        now = time.time()

    # First flip: just add to flipped
    if len(session.flipped_card_ids) == 0:
        updated = replace(
            session,
            flipped_card_ids=session.flipped_card_ids + [card_id],
        )
        return (apply_countdown_if_expired(updated, now), None)

    # Second flip: resolve match/mismatch
    other_id = session.flipped_card_ids[0]
    other = _card_by_id(session, other_id)

    if other is None:
        raise InvalidFlip("Something wrong: first card was not flipped")

    is_match = card.emoji == other.emoji

    if is_match:
        new_matched = session.matched_card_ids | {card_id, other_id}
        new_pairs = len(new_matched) // 2
        total_pairs = len(session.board) // 2
        new_status: GameStatus = "won" if new_pairs >= total_pairs else "playing"
        updated = replace(
            session,
            status=new_status,
            turns=session.turns + 1,
            flipped_card_ids=[],
            matched_card_ids=new_matched,
        )
        updated = apply_countdown_if_expired(updated, now)
        return (updated, None)
    else:
        new_bad = session.bad_guesses + 1
        max_bad = session.settings.max_bad_guesses
        new_status = "lost" if (max_bad is not None and new_bad >= max_bad) else "playing"
        updated = replace(
            session,
            status=new_status,
            turns=session.turns + 1,
            bad_guesses=new_bad,
            flipped_card_ids=[],
        )
        updated = apply_countdown_if_expired(updated, now)
        mismatch_pair = [(other_id, other.emoji), (card_id, card.emoji)]
        return (updated, mismatch_pair)


def restart_game(
    session: GameSession,
    *,
    now: float | None = None,
) -> GameSession:
    """
    Same game_id, settings, etc.; new board (regenerate + shuffle), reset stats.
    """
    if now is None:
        now = time.time()
    new_board = _build_board(session.settings)
    return replace(
        session,
        board=new_board,
        status="playing",
        started_at=now,
        turns=0,
        bad_guesses=0,
        flipped_card_ids=[],
        matched_card_ids=set(),
    )


def build_public_view(
    session: GameSession,
    *,
    reveal_emoji: dict[str, str] | None = None,
) -> PublicGameView:
    """Build public view. reveal_emoji: optional card_id -> emoji to include for face-down cards (e.g. mismatch pair)."""
    if session.status == "playing":
        remaining = get_remaining_seconds(session)
    else:
        remaining = 0

    reveal = reveal_emoji or {}
    public_cards: list[PublicCard] = []
    for c in session.board:
        is_face_up = c.id in session.flipped_card_ids or c.id in reveal
        is_matched = c.id in session.matched_card_ids
        show_emoji = is_face_up or is_matched or (c.id in reveal)
        emoji_val = reveal.get(c.id) if c.id in reveal else (c.emoji if show_emoji else None)
        public_cards.append(
            PublicCard(
                id=c.id,
                is_face_up=is_face_up,
                is_matched=is_matched,
                emoji=emoji_val,
            )
        )

    state = GameState.from_session(session, remaining)
    return PublicGameView(
        game_id=session.game_id,
        board=public_cards,
        settings=session.settings,
        state=state,
    )
