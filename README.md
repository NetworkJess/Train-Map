# Train-Map

Live Irish Rail times and a map of the rail network, built with Next.js. Pick a
station to see its upcoming departures and expected times, see every station on
a map, and sign in to save preferred stations that follow you between visits.

Data comes from the official
[Irish Rail realtime API](https://api.irishrail.ie/realtime/) (no key
required). The map uses [Leaflet](https://leafletjs.com/) with OpenStreetMap
tiles. User accounts and saved stations are stored in
[Supabase](https://supabase.com/).

---

## Requirements

- **Node.js 18.17 or newer** (built and tested on Node 22) — check with
  `node -v`
- **npm** (ships with Node) — check with `npm -v`
- A **Supabase project** (free tier) — see step 3 below

You do **not** need to install Next.js, React, Leaflet or Supabase globally;
`npm install` handles all of them.

---

## Run it locally

### 1. Clone and install

```bash
git clone git@github.com:NetworkJess/Train-Map.git
cd Train-Map
npm install
```

### 2. Set up the database

In your Supabase project's **SQL Editor**, create the table:

```sql
create table public.favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  station_code text not null,
  station_name text not null,
  created_at timestamptz not null default now()
);

alter table public.favourites alter column user_id set default auth.uid();
alter table public.favourites enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.favourites to anon, authenticated;

create policy "own favourites readable" on public.favourites
  for select using (auth.uid() = user_id);

create policy "own favourites insertable" on public.favourites
  for insert with check (auth.uid() = user_id);
```

> **Both grants and policies are needed.** Table privileges and row-level
> security are separate mechanisms: without the grants you get
> `permission denied for table favourites`, and without the policies every
> user would see every row.

### 3. Add environment variables

Create **`.env.local`** in the project root (it is gitignored — never commit
it) with the two values from your Supabase project's
**Settings → API** page:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

No quotes, no spaces around `=`. The anon key is designed to be public — it is
safe in the browser. Security is enforced by the row-level policies above.

### 4. Run

```bash
npm run dev
```

Open **http://localhost:3000**.

The dev server must stay running while you use the app. Stop it with `Ctrl-C`.

> If port 3000 is already in use, run `npm run dev -- -p 3001` instead.

> **Restart the dev server after changing `.env.local`.** Environment variables
> are read once at startup; a running server will not see new values.

---

## What you'll see

- **`/`** — three panels: the account and station picker with your saved
  favourites on the left, a map of the rail network in the middle, and the
  selected station's live departures on the right.
- **`/login`** — sign up or sign in with an email and password.

Selecting a station from the dropdown, by clicking a map marker, or by
clicking a saved favourite all update the same selection, so the map, the
picker and the times panel never disagree.

Favourites require an account. When signed out, the picker and map still work
but nothing can be saved.

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

**Pages 404, 500, or hang after being fine** — a stale build cache, often caused
by a build running against a live dev server. Stop the server, then:

```bash
rm -rf .next
npm run dev
```

**`supabaseUrl is required`** — the environment variables are missing or
misnamed. Check `.env.local` exists in the project root and uses exactly
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then restart
the dev server.

**`permission denied for table favourites`** — the SQL grants are missing.
Row-level security policies do not grant table access; both are required. See
step 2.

**`/api/favourites` returns `401`** — expected when there's no signed-in
session. The route requires a `Bearer` token; opening the URL directly in a
browser address bar can never send one. It returns `401` by design.

**Favourites list is empty despite saving** — check the two-account case: rows
are scoped to the user who saved them. If a row was inserted before sign-in
existed, its `user_id` is `null` and it will match no user.

**The page loads but no stations appear** — a proxy route failed. Check the
terminal for an error, and confirm your machine can reach
`https://api.irishrail.ie` in a browser.

**Times are blank** — Irish Rail returns a departure field spelled
`Expdepart` (not `Exdepart`). The parser fails silently on a wrong field name,
so this is always worth checking first.

**`/map` shows a grey or blank box** — a Leaflet container with no height. The
map must have an explicit height; Leaflet cannot measure a container whose
height is `0` or `auto`.

**Map markers are invisible or square** — markers use a styled `divIcon`
rather than Leaflet's default images, so no PNG is fetched. If a marker is
missing entirely, check the station's coordinates: Irish Rail reports `0, 0`
for a few stations, which are filtered out, and one station (Adamstown) reports
a truncated longitude.

**`Module not found: Can't resolve '@/...'`** — the `@/` alias points at the
**project root**, so `@/components/x` means `Train-map/components/x`, *not*
`Train-map/app/components/x`. The alias is configured in `jsconfig.json` and is
read at server startup, so restart `npm run dev` after changing it.

**`window is not defined`** — a browser-only library (Leaflet) is being
rendered on the server. It must be loaded with `next/dynamic` and
`ssr: false`, which is what `app/components/map.jsx` does.

---

## Project structure

```
Train-map/
├── app/
│   ├── layout.js                # page shell, metadata, global CSS import
│   ├── globals.css              # theme: marker + Leaflet popup styles
│   ├── page.js                  # "/" — three-panel app (client component)
│   ├── login/
│   │   └── page.js              # "/login" — sign in / sign up
│   ├── map/
│   │   └── page.js              # "/map" — standalone map view
│   ├── components/
│   │   ├── train-list.jsx       # renders the list of departures
│   │   ├── map.jsx              # dynamic wrapper (ssr: false) for Leaflet
│   │   ├── leaflet-map.jsx      # the actual Leaflet map + markers
│   │   └── auth-form.jsx        # sign in / sign up form
│   └── api/
│       ├── stations/route.js    # GET station list (JSON)
│       ├── trains/route.js      # GET live times for a station (XML proxy)
│       ├── trains/json/route.js # GET live times for a station (JSON)
│       ├── trains/now/route.js  # GET the server's current time
│       └── favourites/route.js  # GET/POST saved stations (token required)
├── lib/
│   ├── irishrail.js             # Irish Rail fetch + XML parsing
│   └── supabase.js              # Supabase clients + auth helpers
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
only loads in the browser.

**Two Supabase clients.** `lib/supabase.js` exports a shared client (anonymous)
and `supabaseAsUser(token)`, which builds a per-request client that carries a
user's access token. The shared client is used in the browser, where the
session already exists; the per-request one is used in route handlers, which
otherwise have no idea who is asking.

---

## API

| Method | Route | Auth | Returns |
|---|---|---|---|
| GET | `/api/stations` | — | Station list (JSON) |
| GET | `/api/trains?station=CNLLY` | — | Live times for a station (raw XML) |
| GET | `/api/trains/json?station=CNLLY` | — | Live times for a station (JSON) |
| GET | `/api/trains/now` | — | The server's current local time |
| GET | `/api/favourites` | Bearer token | The signed-in user's saved stations |
| POST | `/api/favourites` | Bearer token | Saves a station for that user |

`/api/favourites` expects `Authorization: Bearer <access_token>` and returns
`401` without it. Request bodies and responses use camelCase
(`stationCode`, `stationName`); database columns use snake_case.

Station codes are short and not guessable — `CNLLY` is Dublin Connolly. Get the
full list from `/api/stations`. An unknown station code returns `200` with an
empty list, not an error.

---

## Notes

- Favourites are scoped per user by row-level security, so two accounts cannot
  see each other's saved stations.
- Duplicate saves are prevented by the UI but not by the database; a unique
  constraint on `(user_id, station_code)` would enforce it properly.
- No email confirmation is required in development, but a production app should
  keep it enabled.
- The app is deployed with Netlify, which builds from `main` on every push.
