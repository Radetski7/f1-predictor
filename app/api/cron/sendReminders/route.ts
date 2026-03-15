import { readSheet } from "@/lib/googleSheets";
import { sendReminderEmail } from "@/lib/email";
import { users } from "@/lib/users";

/**
 * GET /api/cron/sendReminders
 *
 * Checks for races whose FP1 starts tomorrow (within the next 24-48 hours)
 * and sends reminder emails to users who have NOT yet submitted a prediction.
 *
 * Protect this route with a CRON_SECRET so only your scheduler can call it.
 */
export async function GET(req: Request) {
  // Verify the request is from an authorized cron job
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find races whose FP1 starts between 24h and 48h from now
  // This means if the cron runs daily, it catches races ~1 day before FP1
  const races = await readSheet("races");
  const upcomingRaces = races.slice(1).filter((r: string[]) => {
    const fp1Start = new Date(r[2]);
    return fp1Start >= oneDayFromNow && fp1Start < twoDaysFromNow;
  });

  if (upcomingRaces.length === 0) {
    return Response.json({ message: "No races starting tomorrow", sent: 0 });
  }

  // Get all existing predictions
  const predictions = await readSheet("predictions");
  const predictionRows = predictions.slice(1); // skip header

  let totalSent = 0;
  const results: { race: string; user: string; status: string }[] = [];

  for (const race of upcomingRaces) {
    const raceId = race[0];
    const raceName = race[1];
    const fp1Start = race[2];

    // Find users who have already submitted for this race
    const usersWhoSubmitted = new Set(
      predictionRows
        .filter((p: string[]) => p[0] === raceId)
        .map((p: string[]) => p[1])
    );

    // Send reminders to users who have NOT submitted
    for (const user of users) {
      if (usersWhoSubmitted.has(user.name)) {
        results.push({ race: raceName, user: user.name, status: "already_submitted" });
        continue;
      }

      try {
        await sendReminderEmail(user.email, user.name, raceName, fp1Start);
        results.push({ race: raceName, user: user.name, status: "sent" });
        totalSent++;
      } catch (error) {
        console.error(`Failed to send reminder to ${user.name}:`, error);
        results.push({ race: raceName, user: user.name, status: "failed" });
      }
    }
  }

  return Response.json({
    message: `Sent ${totalSent} reminder(s)`,
    sent: totalSent,
    details: results,
  });
}

