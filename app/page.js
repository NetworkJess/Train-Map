"use client";

import { useState, useEffect } from "react";
import TrainList from "@/app/components/train-list";
import Map from "@/app/components/map";
import { supabase, onAuthChange, signOut} from "@/lib/supabase";
import Link from "next/link";

export default function Page() {
  // state: "the current station", starts empty until user picks one.
  const [station, setStation] = useState("");
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);

  const alreadyFaved = favourites.some((f) => f.station_code === station);
  
  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      if (!u) setFavourites([]);
      else loadFavourites();
    });
    return () => unsub.data.subscription.unsubscribe();
  }, []);

  async function loadFavourites() {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/favourites", {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (!res.ok) return setFavourites([]);
    const json = await res.json();
    setFavourites(json.favourites);
  }

  async function favouriteSelected() {
    const s = stations.find((x) => x.code === station);
    if (!s || !user) return;
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/favourites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ stationCode: s.code, stationName: s.name }),
    });
    await loadFavourites();
  }

  // On first load, fetch the station list once.
  useEffect(() => {
    fetch("/api/stations")
      .then((r) => r.json())
      .then((data) => setStations(data.stations));
  }, []);

  // When the chosen station changes, fetch its live trains.
  useEffect(() => {
    if (!station) return;
    setLoading(true);
    fetch(`/api/trains/json?station=${station}`)
    .then((r) => r.json())          // ← gets JSON now
    .then((data) => setTrains(data.trains))
    .finally(() => setLoading(false))
  }, [station]);

  return (
      <>
    <h1 style={{textAlign:"center", fontFamily: "monospace"}}>Irish Rail · live times </h1>
    
    <main style={{ 
      fontFamily: "monospace", 
      padding: 20, 
      lineHeight: 1.6, 
      display: "grid",
      gridTemplateColumns: "260px 1fr 300px",
      gap: 12,
      boxSizing: "border-box",
      height: "calc(100vh - 60px)", }}>

    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* 1. account */}
      {user ? (
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: "bold" }}>{user.email}</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <div>
          <Link href="/login">Sign in</Link>
        </div>
      )}

      {/* 2. station picker + favourite button */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="station">Station</label>
        <select
          id="station"
          value={station}
          onChange={(e) => setStation(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="">— choose a station —</option>
          {stations.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
        <button onClick={favouriteSelected} disabled={!station || !user || alreadyFaved}>
          {alreadyFaved ? "★ Saved" : "☆ Save to favourites"}
        </button>
      </div>

      {/* 3. favourites list */}
      <div>
        <p style={{ margin: "0 0 6px", fontSize: 13, opacity: 0.7 }}>Favourites</p>
        {favourites.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, opacity: 0.5 }}>
            {user ? "None saved yet." : "Sign in to save stations."}
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {favourites.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => setStation(f.station_code)}
                  style={{ background: "none", border: "none", color: "inherit",
                          font: "inherit", cursor: "pointer", padding: 0 }}
                >
                  {f.station_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </section>

      <section>
        <Map 
              center={[53.3498, -6.2603]} 
              markers={stations}
              onSelect={setStation} />

      </section>

      <section>

        {/* lists + props: paint the live times for the chosen station */}
        {!station ? (
            <p>Pick a station to see live times.</p>
          ) : (
            <TrainList trains={trains} loading={loading} />
          )}

      </section>
    </main>
    </>
  );
}

// Very small XML parser helpers (Irish Rail returns XML, not JSON).



function parseTrains(xml) {
  const blocks = xml.split("<objStationData>").slice(1);
  return blocks
    .map((b) => ({
      destination: tag(b, "Destination"),
      exptime: tag(b, "Expdepart"), // expected departure
    }))
    .filter((t) => t.destination);
}
