// app/api/predictionsByRace/route.ts
import { readSheet } from "@/lib/googleSheets";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const race_id = searchParams.get("race_id");
  
  if (!race_id) {
    return Response.json({ error: "race_id is required" }, { status: 400 });
  }

  // Get race info
  const races = await readSheet("races");
  const race = races.slice(1).find((r: string[]) => r[0] === race_id);
  
  if (!race) {
    return Response.json({ error: "Race not found" }, { status: 404 });
  }

  // Get predictions for this race
  const predictions = await readSheet("predictions");
  const rows = predictions.slice(1); // skip header
  
  const racePredictions = rows
    .filter((r: string[]) => r[0] === race_id)
    .map((r: string[]) => ({
      user: r[1],
      pole: r[2],
      p1: r[3],
      p2: r[4],
      p3: r[5],
      submittedAt: r[6],
    }));

  return Response.json({
    race: {
      id: race[0],
      name: race[1],
    },
    predictions: racePredictions,
  });
}