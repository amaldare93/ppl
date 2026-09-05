# Local Magic League Dashboard

This project is a Next.js app for tracking a local Magic league. It includes:

- a home page with league overview information
- a standings page for current player records and points
- a deck archetype page for visualizing what decks are being played
- a local SQLite-backed database for manual deck tracking and weekly imports
- API routes for standings, deck breakdowns, and importing weekly data

## Getting started

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

## Weekly import

You can import standings from the WotC GraphQL endpoint with:

```bash
npm run import:standings
```

The importer reads the event ID and round from your environment and writes the results into the local database.

## Manual deck tracking

You can manually assign a deck archetype to a player via the API endpoint:

```bash
curl -X POST http://localhost:3000/api/league/decks/assign \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","archetypeName":"Mono-Black Devotion","weekLabel":"Week 1","notes":"Main deck"}'
```
