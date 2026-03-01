// app/api/races/route.ts
import { readSheet } from "@/lib/googleSheets";

export async function GET() {
  const races = await readSheet("races");
  const data = races.slice(1).map((r: string[]) => ({
    id: r[0],
    name: r[1],
  }));
  return Response.json({ races: data });
}