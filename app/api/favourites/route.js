import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("favourites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ favourites: data });
}

export async function POST(request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("favourites")          // table
    .insert({                    // ← the insert function
      station_code: body.station_code,
      station_name: body.station_name,
    })
    .select();                   // returns the inserted row

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ favourite: data[0] });
}