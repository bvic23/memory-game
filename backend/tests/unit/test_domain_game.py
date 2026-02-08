import random
from collections import Counter

import pytest

from src.domain.game import (
    apply_countdown_if_expired,
    build_public_view,
    create_game,
    flip_card,
    get_remaining_seconds,
    restart_game,
)
from src.domain.types import Settings
from src.errors import InvalidSettings, InvalidFlip


def _default_settings(
    user_name: str = "alice",
    card_count: int = 8,
    countdown_seconds: int = 60,
    flip_back_delay_ms: int = 800,
    max_bad_guesses: int | None = None,
) -> Settings:
    return Settings(
        user_name=user_name,
        card_count=card_count,
        countdown_seconds=countdown_seconds,
        flip_back_delay_ms=flip_back_delay_ms,
        max_bad_guesses=max_bad_guesses,
    )


def _find_two_matching_card_ids(session, exclude_ids=None):
    """Return (id1, id2) for a pair of cards with the same emoji."""
    exclude_ids = exclude_ids or set()
    by_emoji = {}

    for c in session.board:
        if c.id in exclude_ids:
            continue
        by_emoji.setdefault(c.emoji, []).append(c.id)

    for ids in by_emoji.values():
        if len(ids) >= 2:
            return ids[0], ids[1]

    raise AssertionError("no pair found")


def _find_two_different_card_ids(session):
    """Return (id1, id2) for two cards with different emojis."""
    for a in session.board:
        for b in session.board:
            if a.id != b.id and a.emoji != b.emoji:
                return a.id, b.id
    raise AssertionError("no distinct pair found")


# --- Create game ---


def test_create_game_returns_playing_session():
    """Create game returns playing session"""
    random.seed(42)
    session = create_game("g1", _default_settings(), now=1000.0)
    assert session.game_id == "g1"
    assert session.user_name == "alice"
    assert session.status == "playing"
    assert len(session.matched_card_ids) == 0
    assert session.turns == 0
    assert session.bad_guesses == 0
    assert session.started_at == 1000.0
    assert len(session.board) == 8
    assert len(session.flipped_card_ids) == 0
    assert len(session.matched_card_ids) == 0


def test_create_game_odd_card_count_raises():
    """Create game with odd card count raises InvalidSettings"""
    with pytest.raises(InvalidSettings, match="even"):
        create_game("g1", _default_settings(card_count=7))


def test_create_game_too_many_pairs_raises():
    # 26 pairs = 52 cards; domain allows repeated emojis from EMOJI_SET
    session = create_game("g1", _default_settings(card_count=52))
    assert len(session.board) == 52


# --- Flip: matching pair ---


def test_flip_two_matching_cards_increments_matched_pairs_and_turns():
    random.seed(123)
    session = create_game("g1", _default_settings(), now=1000.0)
    id1, id2 = _find_two_matching_card_ids(session)

    session, _ = flip_card(session, id1, now=1000.0)
    assert len(session.matched_card_ids) == 0
    assert session.turns == 0
    
    session, _ = flip_card(session, id2, now=1000.0)
    assert len(session.matched_card_ids) == 2
    assert session.turns == 1
    assert id1 in session.matched_card_ids
    assert id2 in session.matched_card_ids
    assert len(session.flipped_card_ids) == 0


def test_flip_all_pairs_sets_status_won():
    random.seed(456)
    # 4 cards = 2 pairs; must match both pairs to win
    session = create_game("g1", _default_settings(card_count=4), now=1000.0)
    id1, id2 = _find_two_matching_card_ids(session)

    session, _ = flip_card(session, id1, now=1000.0)
    session, _ = flip_card(session, id2, now=1000.0)
    
    id3, id4 = _find_two_matching_card_ids(session, exclude_ids=session.matched_card_ids)
    session, _ = flip_card(session, id3, now=1000.0)
    session, _ = flip_card(session, id4, now=1000.0)
    
    assert session.status == "won"


# --- Flip: mismatch ---


def test_flip_two_non_matching_cards_increments_bad_guesses_and_turns():
    random.seed(789)
    session = create_game("g1", _default_settings(), now=1000.0)

    id1, id2 = _find_two_different_card_ids(session)
    session, _ = flip_card(session, id1, now=1000.0)
    session, _ = flip_card(session, id2, now=1000.0)
    
    assert session.bad_guesses == 1
    assert session.turns == 1
    assert len(session.flipped_card_ids) == 0

    # Cards are face-down again
    view = build_public_view(session)
    for card in view.board:
        assert not card.is_face_up
        assert not card.is_matched


# --- maxBadGuesses ---


def test_max_bad_guesses_exceeded_sets_status_lost():
    random.seed(111)
    session = create_game(
        "g1",
        _default_settings(card_count=6, max_bad_guesses=2),
        now=1000.0,
    )
    # Two mismatches
    for _ in range(2):
        id1, id2 = _find_two_different_card_ids(session)
        session, _ = flip_card(session, id1, now=1000.0)
        session, _ = flip_card(session, id2, now=1000.0)
    assert session.bad_guesses == 2
    assert session.status == "lost"


# --- Invalid flip ---


def test_flip_when_game_ended_raises():
    random.seed(222)
    session = create_game("g1", _default_settings(card_count=4), now=1000.0)
    for _ in range(2):  # match both pairs to end game
        id1, id2 = _find_two_matching_card_ids(session, exclude_ids=session.matched_card_ids)
        session, _ = flip_card(session, id1, now=1000.0)
        session, _ = flip_card(session, id2, now=1000.0)
    assert session.status == "won"
    with pytest.raises(InvalidFlip, match="not in progress"):
        flip_card(session, session.board[0].id, now=1000.0)


def test_flip_same_card_twice_raises():
    random.seed(333)
    session = create_game("g1", _default_settings(), now=1000.0)
    card_id = session.board[0].id
    session, _ = flip_card(session, card_id, now=1000.0)
    with pytest.raises(InvalidFlip, match="already face-up"):
        flip_card(session, card_id, now=1000.0)


def test_flip_third_card_when_two_face_up_raises():
    """When two cards are already face-up (invalid state), flipping a third is rejected."""
    from src.domain.types import GameSession, InternalCard
    # Manually build a session with 2 flipped (e.g. from bug or old client)
    board = [
        InternalCard("c0", "🦊"),
        InternalCard("c1", "🦊"),
        InternalCard("c2", "🐶"),
        InternalCard("c3", "🐶"),
    ]
    settings = _default_settings(card_count=4)
    session = GameSession(
        game_id="g1",
        user_name="alice",
        settings=settings,
        board=board,
        status="playing",
        started_at=1000.0,
        turns=0,
        bad_guesses=0,
        flipped_card_ids=["c0", "c2"],
        matched_card_ids=set(),
    )
    with pytest.raises(InvalidFlip, match="Already two cards"):
        flip_card(session, "c3", now=1000.0)


def test_flip_unknown_card_raises():
    session = create_game("g1", _default_settings(), now=1000.0)
    with pytest.raises(InvalidFlip, match="Card not found"):
        flip_card(session, "card-999", now=1000.0)


# --- Restart ---


def test_restart_new_board_and_reset_state():
    random.seed(666)
    session = create_game("g1", _default_settings(), now=1000.0)
    first_board_emojis = [c.emoji for c in session.board]
    id1, id2 = _find_two_matching_card_ids(session)
    session, _ = flip_card(session, id1, now=1000.0)
    session, _ = flip_card(session, id2, now=1000.0)
    assert len(session.matched_card_ids) == 2
    session = restart_game(session, now=2000.0)
    assert session.game_id == "g1"
    assert session.user_name == "alice"
    assert session.status == "playing"
    assert len(session.matched_card_ids) == 0
    assert session.turns == 0
    assert session.bad_guesses == 0
    assert session.started_at == 2000.0
    assert len(session.board) == 8
    assert len(session.flipped_card_ids) == 0
    assert len(session.matched_card_ids) == 0
    # Board is new (shuffle and possibly different emoji selection)
    new_emojis = [c.emoji for c in session.board]
    assert len(new_emojis) == len(first_board_emojis)
    # Each emoji appears an even number of times (pairs)
    assert all(c % 2 == 0 for c in Counter(new_emojis).values())


# --- Countdown ---


def test_countdown_expiration_sets_status_lost():
    session = create_game(
        "g1",
        _default_settings(card_count=4, countdown_seconds=10),
        now=1000.0,
    )
    assert get_remaining_seconds(session, now=1005.0) == 5
    session = apply_countdown_if_expired(session, now=1005.0)
    assert session.status == "playing"
    session = apply_countdown_if_expired(session, now=1011.0)  # past 10s
    assert session.status == "lost"


def test_flip_after_countdown_expired_checks_countdown():
    # After a flip that resolves, we call apply_countdown_if_expired. So if
    # we're past time, the session should end as lost.
    random.seed(777)
    session = create_game(
        "g1",
        _default_settings(card_count=6, countdown_seconds=10),
        now=1000.0,
    )
    id1, id2 = _find_two_different_card_ids(session)
    session, _ = flip_card(session, id1, now=1000.0)
    # Resolve second flip at t=1015 (countdown expired)
    session, _ = flip_card(session, id2, now=1015.0)
    assert session.status == "lost"


# --- Public view ---


def test_public_view_hides_emoji_when_face_down():
    random.seed(888)
    session = create_game("g1", _default_settings(), now=1000.0)
    view = build_public_view(session)
    assert view.game_id == "g1"
    for card in view.board:
        assert not card.is_face_up
        assert not card.is_matched
        assert card.emoji is None


def test_public_view_shows_emoji_when_face_up_or_matched():
    random.seed(999)
    session = create_game("g1", _default_settings(), now=1000.0)
    card_id = session.board[0].id
    session, _ = flip_card(session, card_id, now=1000.0)
    view = build_public_view(session)
    for card in view.board:
        if card.id == card_id:
            assert card.is_face_up
            assert card.emoji is not None
        else:
            assert card.emoji is None
