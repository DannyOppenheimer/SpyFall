# SpyFall

A web-based implementation of the popular social deduction game [Spyfall](https://en.wikipedia.org/wiki/Spyfall_(card_game)). Players join shared game rooms using a 5-letter code. One player is secretly assigned as the Spy — everyone else knows the location. The Spy must figure out the location before being voted out.

**Live at [spyfall.dannyoppenheimer.com](https://spyfall.dannyoppenheimer.com)**

---

## Features

- Create or join game rooms with a 5-letter room code
- Supports Spyfall 1 locations, Spyfall 2 locations, and a custom extra pack
- Real-time multiplayer via WebSockets
- Configurable match timer (5–20 minutes)
- Location and player reference sheets in-game

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Real-time | Socket.IO v2 |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend hosting | [Railway](https://railway.app) |
| Frontend hosting | GitHub Pages |
| Domain | Cloudflare |

## Architecture

The project uses a split deployment:

- **Frontend** — static files served via GitHub Pages from the `/docs` directory, available at `spyfall.dannyoppenheimer.com`
- **Backend** — Node.js/Socket.IO server hosted on Railway at `spyfall-production-5f2b.up.railway.app`, handles all game logic and real-time communication

## Running Locally

**Prerequisites:** Node.js

```bash
git clone https://github.com/DannyOppenheimer/SpyFall.git
cd SpyFall
npm install
npm start
```

The server starts on port 3000 by default. Open `http://localhost:3000` in your browser.

Note: when running locally the frontend JS files point to the production Railway backend. To use a local backend, update the `io(...)` URL in `docs/create_room.js`, `docs/join_room.js`, and `docs/game_room.js` to `http://localhost:3000`.

## Issues & Suggestions

Open an issue in the [Issues tab](https://github.com/DannyOppenheimer/SpyFall/issues).

— Danny
