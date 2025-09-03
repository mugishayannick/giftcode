import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { Player } from "@/types/player";

export async function GET() {
  const playersCol = await getCollection<Player>("players");
  const players = await playersCol
    .find({}, { projection: { _id: 0, id: 1, name: 1 } })
    .sort({ id: 1 })
    .toArray();
  return NextResponse.json({ players });
}
