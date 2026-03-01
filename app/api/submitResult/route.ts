// app/api/submitResult/route.ts
import { readSheet, appendRow } from "@/lib/googleSheets";

export async function POST(req: Request) {
  const body = await req.json();
  const { race_id, quali_p1, quali_p2, race_p1, race_p2, race_p3, race_p4 } = body;

  // Validate required fields
  if (!race_id || !quali_p1 || !quali_p2 || !race_p1 || !race_p2 || !race_p3 || !race_p4) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  // Validate race exists
  const races = await readSheet("races");
  const race = races.find((r: string[]) => r[0] === race_id);
  
  if (!race) {
    return Response.json({ error: "Race not found" }, { status: 400 });
  }

  // Check if result already exists for this race
  const results = await readSheet("results");
  const existingResult = results.slice(1).find((r: string[]) => r[0] === race_id);
  
  if (existingResult) {
    return Response.json(
      { error: "Result already exists for this race" },
      { status: 400 }
    );
  }

  // Append result to sheet
  await appendRow("results", [
    race_id,
    quali_p1,
    quali_p2,
    race_p1,
    race_p2,
    race_p3,
    race_p4,
    new Date().toISOString(),
  ]);

  return Response.json({ success: true });
}