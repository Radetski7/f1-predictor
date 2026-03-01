// app/api/predictionsByUser/route.ts
import { readSheet } from "@/lib/googleSheets";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  if (!user) return Response.json({ race_ids: [] });

  const predictions = await readSheet("predictions");
  const rows = predictions.slice(1); // skip header
  const race_ids = rows
    .filter((r: string[]) => r[1] === user)
    .map((r: string[]) => r[0]);

  return Response.json({ race_ids });
}