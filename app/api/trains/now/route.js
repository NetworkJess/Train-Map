// JSON, not XML: this endpoint tells you the current local time
// on the server that runs the app. (Next.js route handlers can return JSON.)
export async function GET() {
  const now = new Date();
  return Response.json({ station: null, time: now.toLocaleTimeString("en-IE") });
}