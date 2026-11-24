"use client";

export default function TrainList({ trains, loading }) {
  if (loading) return <p>Loading live times…</p>;
  if (trains.length === 0) return <p>No times for this station right now.</p>;
  return (
    <ul>
      {trains.map((t, i) => (
        <li key={i}>
          {t.destination} — {t.exptime}
        </li>
      ))}
    </ul>
  );
}