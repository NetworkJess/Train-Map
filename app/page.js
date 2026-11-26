"use client";

import { useState, useEffect } from "react";
import TrainList from "@/app/components/train-list";
import Map from "@/app/components/map";
import { onAuthChange, getFavourites, signOut} from "@/lib/supabase";
import Link from "next/link";

export default function Page() {
  // state: "the current station", starts empty until user picks one.
  const [station, setStation] = useState("");
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
  const unsub = onAuthChange(async (u) => {
    setUser(u);
    if (u) {
      const rows = await getFavourites(u.id);
      setFavourites(rows);
    } else {
      setFavourites([]);
    }
  });
  return () => unsub.data.subscription.unsubscribe();
}, []);

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

      <section>
        {/* A select filled from the stations list */}
        <label htmlFor="station">  Station  </label>
        <select
          id="station"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        >
          <option value="">— choose a station —</option>
          {stations.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
         {user ? (
            <div style={{ marginTop: 12 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight:"bold" }}>{user.email}</p>
              <button onClick={signOut}>Sign out</button>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <Link href="/login">Sign in</Link>
            </div>
          )}
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
