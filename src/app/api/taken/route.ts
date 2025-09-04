import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { Player } from "@/types/player";

export async function GET() {
  const playersCol = await getCollection<Player>("players");
  const taken = await playersCol
    .find(
      { selectedPlayerId: { $exists: true } },
      { projection: { _id: 0, selectedPlayerId: 1 } }
    )
    .toArray();
  const ids = taken
    .map((d) => d.selectedPlayerId)
    .filter((v): v is number => typeof v === "number");
  return NextResponse.json({ ids });
}
