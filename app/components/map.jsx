"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div style={{ height: 400 }}>Loading map…</div>,
});

export default function Map(props) {
  return <LeafletMap {...props} />;
}