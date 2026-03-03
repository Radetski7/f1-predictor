// app/api/races/route.ts
import { readSheet } from "@/lib/googleSheets";

export async function GET() {
  const races = await readSheet("races");
  const now = new Date();
  
  // Columns: id (0), name (1), fp1_start (2)
  const data = races.slice(1).map((r: string[]) => {
    const fp1_start = new Date(r[2]);
    const isPredictionLocked = now > fp1_start;
    const canEnterResults = now >= fp1_start;
    
    return {
      id: r[0],
      name: r[1],
      fp1_start: r[2],
      isPredictionLocked,
      canEnterResults,
    };
  });
  
  return Response.json({ races: data });
}
