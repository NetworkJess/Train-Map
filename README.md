# Train-Map

Live Irish Rail times, built with Next.js. Pick a station and see its upcoming
departures and expected times, fetched from Irish Rail's free real-time API.

Based on the official [Irish Rail realtime API](https://api.irishrail.ie/realtime/)
(no key required).

---

## Requirements

- **Node.js 18.17 or newer** (built and tested on Node 22) — check with
  `node -v`
- **npm** (ships with Node) — check with `npm -v`

You do **not** need to install Next.js or React globally; `npm install` handles
both.

---

## Run it locally

```bash
git clone git@github.com:NetworkJess/Train-Map.git
cd Train-Map
npm install
npm run dev
```

Then open **http://localhost:3000**.

The dev server must stay running while you use the app. Stop it with `Ctrl-C`.

> If port 3000 is already in use, run `npm run dev -- -p 3001` instead.

---

## What you'll see

- A station dropdown, filled with every Irish Rail station.
- Pick a station to load its live trains: destination and expected departure.
- The station list is fetched once on load; times are fetched each time you
  change station.

---

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server on http://localhost:3000 (hot reload) |
| `npm run build` | Production build — run this before pushing to catch errors |
| `npm start` | Serve the production build (after `npm run build`) |

**Don't run `npm run build` while `npm run dev` is running** — both use the
`.next/` folder and the dev server will break. Stop it with `Ctrl-C` first.

---

## Troubleshooting

**`npm install` fails** — check `node -v` is 18.17+. Delete `node_modules` and
`package-lock.json`, then `npm install` again.

**`npm install` prints "vulnerabilities"** — those come from Next.js 14's own
dependencies. It's a warning, not a failure: the app still runs. Don't run
`npm audit fix --force` casually (it can jump Next.js major versions and break
the app) — just note it in the report as a known limitation.

**Pages error after being fine a minute ago** — a stale build cache. Stop the
server, then:

```bash
rm -rf .next
npm run dev
```

**The page loads but no stations appear** — a proxy route failed. Check the
terminal for an error, and confirm your machine can reach
`https://api.irishrail.ie` in a browser.

**Times are blank** — Irish Rail returns a departure field spelled
`Expdepart` (not `Exdepart`). The parser fails silently on a wrong field name,
so this is always worth checking first.

---

## Project structure

```
Train-map/
├── app/
│   ├── layout.js                # page shell + metadata
│   ├── page.js                  # main page: station picker + live times
│   ├── components/
│   │   └── train-list.jsx       # renders the list of departures
│   └── api/
│       ├── stations/route.js    # GET station list (proxy)
│       ├── trains/route.js      # GET live times for a station (XML proxy)
│       ├── trains/json/route.js # GET live times for a station (JSON)
│       └── trains/now/route.js  # GET the server's current time
├── package.json
└── .gitignore
```

Every folder under `app/api/` with a `route.js` becomes a public URL — that's
why they all live there.

---

## API

This app exposes a few small endpoints of its own:

| Method | Route | Returns |
|---|---|---|
| GET | `/api/stations` | Station list (raw XML from Irish Rail) |
| GET | `/api/trains?station=CNLLY` | Live times for a station (raw XML) |
| GET | `/api/trains/json?station=CNLLY` | Live times for a station (JSON) |
| GET | `/api/trains/now` | The server's current local time (JSON) |

Station codes are short and not guessable — `CNLLY` is Dublin Connolly. Get
the full list from `/api/stations`.

An unknown station code returns `200` with an empty list, not an error.

---

## Notes

- No environment variables are needed at the moment. If a `.env.local` is added
  later (for example for a database), it is covered by `.gitignore` and should
  never be committed.
- The app is currently read-only: it displays live data but stores nothing.
