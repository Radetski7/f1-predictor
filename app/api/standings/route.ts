import { readSheet } from "@/lib/googleSheets";

export async function GET() {
  const predictions = await readSheet("predictions");
  const results = await readSheet("results");

  const preds = predictions.slice(1);
  const res = results.slice(1);

  const pointsMap: Record<string, number> = {};

  // First, initialize all users who have made at least 1 prediction with 0 points
  preds.forEach((pred: string[]) => {
    const user = pred[1];
    if (!(user in pointsMap)) {
      pointsMap[user] = 0;
    }
  });

  // Then calculate points for races that have results
  preds.forEach((pred: string[]) => {
    const [race_id, user, pole, p1, p2, p3] = pred;
    const raceResult = res.find((r: string[]) => r[0] === race_id);
    if (!raceResult) return;

    const [
      _,
      quali_p1,
      quali_p2,
      race_p1,
      race_p2,
      race_p3,
      race_p4,
    ] = raceResult;

    let score = 0;

    // --- POLE (Qualifying P1) ---
    if (pole === quali_p1) {
      score += 1;
    } else if (pole === quali_p2) {
      score += 0.5;
    }

    // --- RACE POSITIONS ---
    const actualRace = [race_p1, race_p2, race_p3, race_p4];
    const predictedRace = [p1, p2, p3];

    predictedRace.forEach((driver, i) => {
      const actualIndex = actualRace.indexOf(driver);

      if (actualIndex === -1) return;

      if (actualIndex === i) {
        score += 1;
      } else if (Math.abs(actualIndex - i) === 1) {
        score += 0.5;
      }
    });

    pointsMap[user] = pointsMap[user] + score;
  });

  const standings = Object.entries(pointsMap)
    .map(([user, points]) => ({ user, points }))
    .sort((a, b) => b.points - a.points);

  return Response.json({ standings });
}
