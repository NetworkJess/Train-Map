export async function getStations() {

const BASE = ("https://api.irishrail.ie/realtime/realtime.asmx");

const res = await fetch(`${BASE}/getAllStationsXML`);
const xml = await res.text();

const blocks = xml.split("<objStation>").slice(1);
const stations = blocks
    .map((b) => ({
      code: tag(b, "StationCode"),
      name: tag(b, "StationDesc"),
      lat: Number(tag(b, "StationLatitude")),
      lon: Number(tag(b, "StationLongitude")),  
}))
    .filter((s) => s.code && s.name && s.lat !== 0 && s.lon !== 0)
    .sort((a, b) => a.name.localeCompare(b.name));

return stations;
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m ? stripWeird(m[1]) : "";
}
function stripWeird(s) {
  return s.replace(/\n/g, "").trim();
}