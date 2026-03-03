// app/api/results/route.ts
import { readSheet } from "@/lib/googleSheets";

export async function GET() {
  const races = await readSheet("races");
  const results = await readSheet("results");
  const now = new Date();

  const racesData = races.slice(1);
  const resultsData = results.slice(1);

  // Create a map of race_id to result
  const resultsMap: Record<string, string[]> = {};
  resultsData.forEach((r: string[]) => {
    resultsMap[r[0]] = r;
  });

  // Return races with their result status
  // Columns: id (0), name (1), fp1_start (2)
  const racesWithResults = racesData.map((race: string[]) => {
    const result = resultsMap[race[0]];
    const fp1_start = new Date(race[2]);
    const canEnterResults = now >= fp1_start;
    
    return {
      id: race[0],
      name: race[1],
      fp1_start: race[2],
      canEnterResults,
      hasResult: !!result,
      result: result
        ? {
            quali_p1: result[1],
            quali_p2: result[2],
            race_p1: result[3],
            race_p2: result[4],
            race_p3: result[5],
            race_p4: result[6],
          }
        : null,
    };
  });

  return Response.json({ races: racesWithResults });
}
