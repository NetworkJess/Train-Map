import Map from "@/app/components/map";

export default function MapPage() {
  return <Map center={[53.3498, -6.2603]} markers={[
    { code: "CNLLY", name: "Connolly", lat: 53.3514, lon: -6.2489 },
    { code: "HEUST", name: "Heuston", lat: 53.3465, lon: -6.2928 },
  ]} />;
}