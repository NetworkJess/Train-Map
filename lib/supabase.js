import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export async function getFavourites(userId) {
  // If userId is given, filter to that user's rows only.
  let query = supabase.from("favourites").select("*");
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function addFavourite(userId, stationCode, stationName) {
  const { data, error } = await supabase
    .from("favourites")
    .insert({ user_id: userId, station_code: stationCode, station_name: stationName })
    .select();
  if (error) throw new Error(error.message);
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(callback) {
  // callback receives the user (or null). Supabase calls it when the
  // session is created / destroyed, and once on page load.
  return supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null));
}