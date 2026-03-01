import { readSheet } from "@/lib/googleSheets";

export async function GET() {
  const races = await readSheet("races");
  return Response.json({ races });
}