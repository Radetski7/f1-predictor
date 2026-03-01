import { readSheet, appendRow } from "@/lib/googleSheets";

export async function POST(req: Request) {
  const body = await req.json();
  const { race_id, user, pole, p1, p2, p3 } = body;

  if (!race_id || !user || !pole || !p1 || !p2 || !p3) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const races = await readSheet("races");
  const race = races.find((r: string[]) => r[0] == race_id);

  if (!race) {
    return Response.json({ error: "Race not found" }, { status: 400 });
  }

  const fp1_start = new Date(race[2]);
  const locked = race[4] === "true";

  if (locked || new Date() > fp1_start) {
    return Response.json({ error: "Predictions locked" }, { status: 400 });
  }

  const predictions = await readSheet("predictions");
  const existingPreds = predictions.slice(1); // remove header row

  // 🔒 Rule 1: user cannot submit twice for same race
  const alreadySubmitted = existingPreds.find(
    (p: string[]) => p[0] == race_id && p[1] === user
  );

  if (alreadySubmitted) {
    return Response.json(
      { error: "You already submitted for this race" },
      { status: 400 }
    );
  }

  // 🔒 Rule 2: no identical prediction allowed for same race
  const duplicatePrediction = existingPreds.find(
    (p: string[]) =>
      p[0] == race_id &&
      p[2] === pole &&
      p[3] === p1 &&
      p[4] === p2 &&
      p[5] === p3
  );

  if (duplicatePrediction) {
    return Response.json(
      { error: "This exact prediction was already taken by another user" },
      { status: 400 }
    );
  }

  await appendRow("predictions", [
    race_id,
    user,
    pole,
    p1,
    p2,
    p3,
    new Date().toISOString(),
  ]);

  return Response.json({ success: true });
}