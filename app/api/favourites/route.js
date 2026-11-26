import { getFavourites, addFavourite } from "@/lib/supabase";

export async function GET() {
  const favourites = await getFavourites();
  return Response.json({ favourites });
}

export async function POST(request) {
  const { stationCode, stationName } = await request.json();
  const rows = await addFavourite(null, stationCode, stationName);
  return Response.json({ favourite: rows[0] }, { status: 201 });
}
