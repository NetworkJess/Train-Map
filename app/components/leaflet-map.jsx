"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const dot = L.divIcon({
  className: "rail-marker",
  iconSize: [8, 8],
  iconAnchor: [4, 4],   // centre the dot on the coordinate
});

export default function LeafletMap({ center, markers, onSelect }) {
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
        <Marker icon={dot} key={m.code} position={[m.lat, m.lon]} eventHandlers={{ click: () => onSelect(m.code) }}>
          <Popup>{m.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}