from starlette.requests import Request

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.games import router as games_router
from src.api.schemas import ErrorResponse
from src.errors import GameNotFound, InvalidFlip, InvalidSettings

app = FastAPI(
    title="Memory Game API",
    version="0.1.0",
    openapi_tags=[
        {"name": "Games", "description": "Create, get, flip, and restart games"},
    ],
)

import os

allowed_origins = [
    "http://localhost:4173",  # Vite preview
    "http://localhost:5173",  # Vite dev
]

frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def no_store_games(request: Request, call_next):
    """Prevent caching of game endpoints so refetches after restart always get fresh state."""
    response = await call_next(request)
    if request.url.path.startswith("/api/games"):
        response.headers["Cache-Control"] = "no-store"
    return response


api_router = APIRouter()


@api_router.get("", include_in_schema=False)
@api_router.get("/", include_in_schema=False)
def api_root():
    """API root; health at /health."""
    return {"status": "ok"}


api_router.include_router(games_router)


@app.get("/health", include_in_schema=False)
def health():
    """Health check for Docker and load balancers."""
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root():
    """Root redirects to docs."""
    return {"docs": "/docs", "health": "/health"}


@app.exception_handler(GameNotFound)
def game_not_found_handler(_request, exc: GameNotFound):
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(error=str(exc), code="NOT_FOUND").model_dump(by_alias=False),
    )


@app.exception_handler(InvalidFlip)
def invalid_flip_handler(_request, exc: InvalidFlip):
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(error=str(exc), code="INVALID_FLIP").model_dump(by_alias=False),
    )


@app.exception_handler(InvalidSettings)
def invalid_settings_handler(_request, exc: InvalidSettings):
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(error=str(exc), code="VALIDATION").model_dump(by_alias=False),
    )


app.include_router(api_router, prefix="/api")
