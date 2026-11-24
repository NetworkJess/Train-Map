// Server-side proxy: the browser can't call Irish Rail directly (CORS), so
// this route fetches the station list for the frontend.
export async function GET() {
  const res = await fetch(
    "https://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML"
  );
  const xml = await res.text();
  return new Response(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}
