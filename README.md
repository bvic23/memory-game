# Memory Game

[![Game Demo](https://img.youtube.com/vi/BJ3DAt03Kro/hqdefault.jpg)](https://youtube.com/shorts/BJ3DAt03Kro?feature=share)

A full-stack memory card matching game built with React (frontend) and FastAPI (backend).

## Prerequisites

* Docker: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
* Bun: [https://bun.com/](https://bun.com/) (npm or yarn also work)
* UV: [https://docs.astral.sh/uv/getting-started/installation/](https://docs.astral.sh/uv/getting-started/installation/) (pip also works)

## Quick Start

Clone the repository and run:

```bash
sh start.sh
```

Backend: [http://localhost:8000](http://localhost:8000)
Frontend: [http://localhost:4173](http://localhost:4173)

## Local Development

### Frontend

```bash
cd frontend
bun install
```

### Backend

```bash
cd backend
uv sync # or pip install -e .
```

### Run both services

```bash
sh dev.sh
```

Backend: [http://localhost:8000](http://localhost:8000)
Frontend with HMR: [http://localhost:5173](http://localhost:5173)

## Testing

### Backend

```bash
cd backend
uv run pytest
```

Alternatively, activate a virtual environment with development dependencies and run `pytest` or `python -m pytest`.

### Frontend

```bash
cd frontend
bun test
```

## Project Structure

```
memory-game/
├── backend/             # FastAPI backend
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── domain/      # Business logic
│   │   ├── services/    # Service layer
│   │   └── storage/     # Data storage
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   ├── main.py          # Entry point
│   ├── pyproject.toml   # Python dependencies
│   └── Dockerfile
├── frontend/            # React frontend
│   ├── src/
│   │   ├── apis/        # API clients
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── states/     # Redux slices
│   │   ├── styles/     # Global styles and tokens
│   │   ├── types/
│   │   └── utils/
│   ├── assets/
│   ├── fonts/
│   ├── package.json     # Node dependencies
│   └── vite.config.ts
├── dev.sh               # Local development (backend + frontend)
├── start.sh             # Production start script
└── docker-compose.yml
```

## Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* Redux Toolkit + RTK Query
* Styled Components
* React Hook Form
* Zod
* Bun

### Backend

* FastAPI
* Pydantic
* Uvicorn
* In-memory storage

## API Documentation

Once the backend is running:

* Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Core Endpoints

* `POST /api/games` . Create a new game
* `GET /api/games/{gameId}` . Retrieve game state
* `POST /api/games/{gameId}/flip` . Flip a card
* `POST /api/games/{gameId}/restart` . Restart the game
* `WS /api/games/{gameId}/timer` . Game timer
* `GET /health` . Health check

## Configuration

### Frontend

```env
VITE_BACKEND_URL=http://localhost:8000
```

### Backend

```env
FRONTEND_URL=http://localhost:5173
```
