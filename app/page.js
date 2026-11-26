"use client";

import { useState, useEffect } from "react";
import TrainList from "@/app/components/train-list";
import Map from "@/app/components/map";

export default function Page() {
  // state: "the current station", starts empty until user picks one.
  const [station, setStation] = useState("");
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);


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
    <h1 style={{textAlign:"center", fontFamily: "monospace"}}>Irish Rail · live times</h1>
    
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
        <label htmlFor="station">Station  </label>
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
      </section>

      <section>
        <Map 
              center={[53.3498, -6.2603]} 
              markers={stations} />

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

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m ? stripWeird(m[1]) : "";
}
function stripWeird(s) {
  return s.replace(/\n/g, "").trim();
}

function parseStations(xml) {
  // Every station appears once per <objStation> block.
  const blocks = xml.split("<objStation>").slice(1);
  return blocks
    .map((b) => ({
      code: tag(b, "StationCode"),
      name: tag(b, "StationDesc"),
    }))
    .filter((s) => s.code && s.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseTrains(xml) {
  const blocks = xml.split("<objStationData>").slice(1);
  return blocks
    .map((b) => ({
      destination: tag(b, "Destination"),
      exptime: tag(b, "Expdepart"), // expected departure
    }))
    .filter((t) => t.destination);
}
