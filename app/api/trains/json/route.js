export async function GET(request) {
  const url = new URL(request.url);
  const station = url.searchParams.get("station") || "CNLLY";

  // reuse the Irish Rail fetch — same as the XML route, but parse to JSON
  const res = await fetch(
    `https://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML?StationCode=${station}`
  );
  const xml = await res.text();

  const blocks = xml.split("<objStationData>").slice(1);
  const trains = blocks
    .map((b) => ({
      destination: tag(b, "Destination"),
      exptime: tag(b, "Expdepart"),
    }))
    .filter((t) => t.destination);

  return Response.json({ station, trains });
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m ? m[1].replace(/\n/g, "").trim() : "";
}
