// Server-side proxy: fetch live train times for a station, then hand the
// XML to the browser. ?station= is the station code (e.g. CNLLY for Connolly).
export async function GET(request) {
  const url = new URL(request.url);
  const station = url.searchParams.get("station") || "CNLLY";
  const res = await fetch(
    `https://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML?StationCode=${encodeURIComponent(
      station
    )}`
  );
  const xml = await res.text();
  return new Response(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}
