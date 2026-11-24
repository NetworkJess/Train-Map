# Train-Map

Live Irish Rail times and a map of the rail network, built with Next.js. Pick a
station to see its upcoming departures and expected times, or open the map to
see the network geographically.

Data comes from the official
[Irish Rail realtime API](https://api.irishrail.ie/realtime/) (no key
required). The map uses [Leaflet](https://leafletjs.com/) with OpenStreetMap
tiles.

---

## Requirements

- **Node.js 18.17 or newer** (built and tested on Node 22) — check with
  `node -v`
- **npm** (ships with Node) — check with `npm -v`

You do **not** need to install Next.js or React globally; `npm install` handles
both — including `leaflet` and `react-leaflet`, which are already listed in
`package.json`.

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

- **`/`** — a station dropdown, filled with every Irish Rail station. Pick one
  to load its live trains: destination and expected departure. The station list
  is fetched once on load; times are fetched each time you change station.
- **`/map`** — a Leaflet map (OpenStreetMap tiles) centred on Ireland. Click a
  marker to see the station name. The map plots a small set of sample stations
  (Connolly and Heuston).

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
dependencies. It's a warning, not a failure: the app still runs. Avoid
`npm audit fix --force`, which can jump Next.js major versions and break the
app.

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

**`/map` shows a grey or blank box** — a Leaflet container with no height. The
map must have an explicit height (this app uses `height: 400px`). Leaflet
cannot measure a container whose height is `0` or `auto`.

**Map markers are missing or look broken** — Leaflet's default marker icon is
loaded from a CSS-relative path that breaks under a bundler. Fix it by passing
an explicit `icon` to `<Marker>`, or by copying `leaflet/dist/images/` into
`public/` and setting `L.Icon.Default.mergeOptions` at import time.

**`Module not found: Can't resolve '@/...'`** — the `@/` alias points at the
**project root**, so `@/components/x` means `Train-map/components/x`, *not*
`Train-map/app/components/x`. The alias is configured in `jsconfig.json` and is
read at server startup, so restart `npm run dev` after changing it.

**`window is not defined`** — a browser-only library (Leaflet) is being
rendered on the server. It must be loaded with `next/dynamic` and
`ssr: false`, which is what `app/components/map.jsx` does. Don't import
`react-leaflet` directly from a server component.

---

## Project structure

```
Train-map/
├── app/
│   ├── layout.js                # page shell + metadata
│   ├── page.js                  # "/" — station picker + live times
│   ├── map/
│   │   └── page.js              # "/map" — passes station data to the map
│   ├── components/
│   │   ├── train-list.jsx       # renders the list of departures
│   │   ├── map.jsx              # dynamic wrapper (ssr: false) for Leaflet
│   │   └── leaflet-map.jsx      # the actual Leaflet map + markers
│   └── api/
│       ├── stations/route.js    # GET station list (proxy)
│       ├── trains/route.js      # GET live times for a station (XML proxy)
│       ├── trains/json/route.js # GET live times for a station (JSON)
│       └── trains/now/route.js  # GET the server's current time
├── jsconfig.json                # "@/" import alias → project root
├── package.json
└── .gitignore
```

Every folder under `app/api/` with a `route.js` becomes a public URL — that's
why they all live there. Folders without a `page.js` or `route.js` (like
`app/components/`) create no URL.

**Why the map is split into two files:** Leaflet touches `window`, which
doesn't exist on the server, so importing it directly crashes the server
render with `window is not defined`. `map.jsx` uses
`next/dynamic(() => import("./leaflet-map"), { ssr: false })` so the real map
only loads in the browser, while `app/map/page.js` can still be a normal
server component.

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
