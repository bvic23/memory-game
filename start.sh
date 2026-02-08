#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# Check Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please visit https://docs.docker.com/get-docker/ and try again."
  exit 1
fi

# Ensure Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Starting Docker..."
  if [[ "$(uname)" == "Darwin" ]]; then
    open -a Docker
  else
    echo "Please start Docker manually and re-run this script."
    exit 1
  fi
  echo "Waiting for Docker to be ready..."
  while ! docker info >/dev/null 2>&1; do
    sleep 2
  done
  echo "Docker is running."
fi

echo "Starting containers..."
docker compose up -d

echo "Waiting for API to be healthy..."
until curl -sf http://localhost:8000/health >/dev/null; do
  sleep 2
done
echo "API is up."

cd frontend
export VITE_BACKEND_URL=http://localhost:8000

echo "Installing frontend dependencies..."
bun install

echo "Building frontend..."
bun run build

echo "Starting frontend preview (testing)..."
echo "  → http://localhost:4173"
exec bun run preview
