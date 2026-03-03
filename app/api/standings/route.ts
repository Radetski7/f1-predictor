import { readSheet } from "@/lib/googleSheets";

type UserStats = {
  points: number;
  exactMatches: number;
  semiMatches: number;
};

export async function GET() {
  const predictions = await readSheet("predictions");
  const results = await readSheet("results");

  const preds = predictions.slice(1);
  const res = results.slice(1);

  const statsMap: Record<string, UserStats> = {};

  // First, initialize all users who have made at least 1 prediction
  preds.forEach((pred: string[]) => {
    const user = pred[1];
    if (!(user in statsMap)) {
      statsMap[user] = { points: 0, exactMatches: 0, semiMatches: 0 };
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

    // --- POLE (Qualifying P1) ---
    if (pole === quali_p1) {
      statsMap[user].points += 1;
      statsMap[user].exactMatches += 1;
    } else if (pole === quali_p2) {
      statsMap[user].points += 0.5;
      statsMap[user].semiMatches += 1;
    }

    // --- RACE POSITIONS ---
    const actualRace = [race_p1, race_p2, race_p3, race_p4];
    const predictedRace = [p1, p2, p3];

    predictedRace.forEach((driver, i) => {
      const actualIndex = actualRace.indexOf(driver);

      if (actualIndex === -1) return;

      if (actualIndex === i) {
        statsMap[user].points += 1;
        statsMap[user].exactMatches += 1;
      } else if (Math.abs(actualIndex - i) === 1) {
        statsMap[user].points += 0.5;
        statsMap[user].semiMatches += 1;
      }
    });
  });

  const standings = Object.entries(statsMap)
    .map(([user, stats]) => ({
      user,
      points: stats.points,
      exactMatches: stats.exactMatches,
      semiMatches: stats.semiMatches,
    }))
    .sort((a, b) => {
      // First sort by points (descending)
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // If points are equal, sort by exact matches (descending)
      return b.exactMatches - a.exactMatches;
    });

  return Response.json({ standings });
}