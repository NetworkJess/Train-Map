"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function LeafletMap({ center, markers }) {
  return (
    <MapContainer
      center={center}
      zoom={8}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker key={m.code} position={[m.lat, m.lon]}>
          <Popup>{m.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}