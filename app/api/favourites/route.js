import { supabaseAsUser } from "@/lib/supabase";

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (!auth) return Response.json({ error: "not signed in" }, { status: 401 });

  const client = supabaseAsUser(auth.replace("Bearer ", ""));

  const { data, error } = await client
    .from("favourites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ favourites: data });
}

export async function POST(request) {
  const auth = request.headers.get("authorization");
  if (!auth) return Response.json({ error: "not signed in" }, { status: 401 });

  const client = supabaseAsUser(auth.replace("Bearer ", ""));
  const { stationCode, stationName } = await request.json();

  const { data, error } = await client
    .from("favourites")
    .insert({ station_code: stationCode, station_name: stationName })
    .select();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ favourite: data[0] }, { status: 201 });
}

export async function DELETE(request) {
  const auth = request.headers.get("authorization");
  if (!auth) return Response.json({ error: "not signed in" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const client = supabaseAsUser(auth.replace("Bearer ", ""));

  const { error } = await client
    .from("favourites")
    .delete()
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return new Response(null, { status: 204 });
}