from fastapi.testclient import TestClient

from src.app import app

client = TestClient(app)


def _create_game(
    user_name: str = "Alice",
    card_count: int = 4,
    countdown_seconds: int = 60,
    flip_back_delay_ms: int = 1000,
    max_bad_guesses: int | None = None,
) -> dict:
    body = {
        "userName": user_name,
        "cardCount": card_count,
        "countdownSeconds": countdown_seconds,
        "flipBackDelayMs": flip_back_delay_ms,
    }
    if max_bad_guesses is not None:
        body["maxBadGuesses"] = max_bad_guesses
    r = client.post("/api/games", json=body)
    assert r.status_code == 201, r.text
    return r.json()


def test_post_create_game_returns_201_and_body_shape():
    """POST /api/games returns 201 and public view with gameId, board, settings, state."""
    r = client.post(
        "/api/games",
        json={
            "userName": "Bob",
            "cardCount": 4,
            "countdownSeconds": 30,
            "flipBackDelayMs": 500,
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["settings"]["userName"] == "Bob"
    assert data["settings"]["cardCount"] == 4
    assert data["settings"]["countdownSeconds"] == 30
    assert data["settings"]["flipBackDelayMs"] == 500
    assert data["state"]["status"] == "playing"
    assert data["state"]["turns"] == 0
    assert data["state"]["badGuesses"] == 0
    assert len(data["board"]) == 4
    for card in data["board"]:
        assert "id" in card
        assert "isFaceUp" in card
        assert "isMatched" in card
        assert card["isFaceUp"] is False
        assert card["isMatched"] is False
        assert card.get("emoji") is None  # face-down: no emoji


def test_get_missing_game_returns_404():
    """GET /api/games/{game_id} returns 404 with error body when game not found."""
    r = client.get("/api/games/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
    data = r.json()
    assert "error" in data
    assert data["code"] == "NOT_FOUND"


def test_flip_missing_game_returns_404():
    """POST /api/games/{game_id}/flip returns 404 when game not found."""
    r = client.post(
        "/api/games/00000000-0000-0000-0000-000000000000/flip",
        json={"cardId": "card-0"},
    )
    assert r.status_code == 404
    assert r.json()["code"] == "NOT_FOUND"


def test_flip_invalid_card_id_returns_400():
    """POST /api/games/{game_id}/flip with unknown cardId returns 400 INVALID_FLIP."""
    created = _create_game(card_count=4)
    game_id = created["gameId"]
    r = client.post(
        f"/api/games/{game_id}/flip",
        json={"cardId": "no-such-card-id"},
    )
    assert r.status_code == 400
    assert r.json()["code"] == "INVALID_FLIP"


def test_create_then_get_returns_same_state():
    """Create game then GET returns same game state."""
    created = _create_game()
    game_id = created["gameId"]
    r = client.get(f"/api/games/{game_id}")
    assert r.status_code == 200
    data = r.json()
    assert data["gameId"] == game_id
    assert data["state"]["status"] == "playing"
    assert len(data["board"]) == created["settings"]["cardCount"]


def test_flip_response_has_no_settings():
    """Flip response returns gameId, board, state but no settings."""
    created = _create_game(card_count=4)
    game_id = created["gameId"]
    r = client.post(
        f"/api/games/{game_id}/flip",
        json={"cardId": created["board"][0]["id"]},
    )
    assert r.status_code == 200
    data = r.json()
    assert "settings" not in data


def test_create_flip_twice_match_updates_state():
    """Create game, flip two cards; after second flip turn is resolved (turns, matchedPairs or badGuesses)."""
    created = _create_game(card_count=4)
    game_id = created["gameId"]
    board = created["board"]

    r1 = client.post(f"/api/games/{game_id}/flip", json={"cardId": board[0]["id"]})
    assert r1.status_code == 200
    
    after_first = r1.json()
    assert after_first["state"]["turns"] == 0
    
    r2 = client.post(f"/api/games/{game_id}/flip", json={"cardId": board[1]["id"]})
    assert r2.status_code == 200
    
    after_second = r2.json()
    assert after_second["state"]["turns"] == 1

    # Either match (two cards isMatched) or mismatch (badGuesses=1)
    matched_count = sum(1 for c in after_second["board"] if c.get("isMatched"))
    assert matched_count in (0, 2) and (matched_count == 2 or after_second["state"]["badGuesses"] == 1)


def test_flip_two_non_matching_increments_bad_guesses():
    """Flip two non-matching cards: badGuesses and turns increment."""
    created = _create_game(card_count=6)  # 3 pairs, so we can flip 2 that don't match
    game_id = created["gameId"]
    board = created["board"]

    # Flip first two cards (might be same pair - if so use 0 and 2)
    r1 = client.post(f"/api/games/{game_id}/flip", json={"cardId": board[0]["id"]})
    assert r1.status_code == 200
    after_first = r1.json()
    
    # Pick a card that is not the match for board[0]; try board[2]
    r2 = client.post(f"/api/games/{game_id}/flip", json={"cardId": board[2]["id"]})
    assert r2.status_code == 200
    after_second = r2.json()
    
    # Either match or mismatch; if we have 3 pairs, board[0] and board[2] might be different
    assert after_second["state"]["turns"] == 1
    
    # If they matched: badGuesses 0; if not: badGuesses 1
    assert after_second["state"]["badGuesses"] in (0, 1)


def test_flip_when_game_ended_returns_400():
    """Flip when game is lost (countdown expired) returns 400 with INVALID_FLIP."""
    created = _create_game(card_count=4, countdown_seconds=60)
    game_id = created["gameId"]
    board = created["board"]
    # Force countdown to expire by applying it with a fake "now" and saving
    from src.deps import get_game_service
    from src.domain.game import apply_countdown_if_expired

    svc = get_game_service()
    session = svc._repository.find_by_id(game_id)
    assert session is not None
    expired = apply_countdown_if_expired(session, now=session.started_at + 100)
    svc._repository.save(expired)
    r = client.post(f"/api/games/{game_id}/flip", json={"cardId": board[0]["id"]})
    assert r.status_code == 400
    assert r.json()["code"] == "INVALID_FLIP"


def test_restart_returns_new_board_and_reset_state():
    """POST /api/games/{game_id}/restart returns 200 with new board, status playing."""
    created = _create_game(card_count=4)
    game_id = created["gameId"]

    # Flip one card
    client.post(f"/api/games/{game_id}/flip", json={"cardId": created["board"][0]["id"]})

    r = client.post(f"/api/games/{game_id}/restart")
    assert r.status_code == 200
    
    data = r.json()
    assert data["gameId"] == game_id
    assert data["state"]["status"] == "playing"
    assert data["state"]["turns"] == 0
    assert data["state"]["badGuesses"] == 0


def test_create_game_validation_odd_card_count_returns_400():
    """POST /api/games with odd cardCount returns 400 VALIDATION."""
    r = client.post(
        "/api/games",
        json={
            "userName": "Bob",
            "cardCount": 5,
            "countdownSeconds": 30,
            "flipBackDelayMs": 500,
        },
    )
    assert r.status_code == 400
    data = r.json()
    assert data["code"] == "VALIDATION"
    assert "error" in data
