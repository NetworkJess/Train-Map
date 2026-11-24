"use client";

import { useState, useEffect } from "react";
import TrainList from "./components/train-list";

export default function Page() {
  // state: "the current station", starts empty until user picks one.
  const [station, setStation] = useState("");
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);


  // On first load, fetch the station list once.
  useEffect(() => {
    fetch("/api/stations")
      .then((r) => r.text())
      .then(parseStations)
      .then(setStations);
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
    <main style={{ fontFamily: "monospace", padding: 20, lineHeight: 1.6 }}>
      <h1>Irish Rail · live times</h1>

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

      {/* lists + props: paint the live times for the chosen station */}
      {!station ? (
          <p>Pick a station to see live times.</p>
        ) : (
          <TrainList trains={trains} loading={loading} />
        )}
    </main>
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
