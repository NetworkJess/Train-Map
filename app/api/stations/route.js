// Server-side proxy: the browser can't call Irish Rail directly (CORS), so
// this route fetches the station list for the frontend.
import { getStations } from "@/lib/irishrail";

export async function GET() {
  return Response.json({ stations: await getStations() });
}