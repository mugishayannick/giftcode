import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/mongodb";
import type { Player } from "@/types/player";

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const playersCol = await getCollection<Player>("players");
  const players = await playersCol
    .find({}, { projection: { _id: 0 } })
    .sort({ id: 1 })
    .toArray();
  const idToName = new Map(players.map((p) => [p.id, p.name] as const));
  const rows = players.map((p) => ({
    id: p.id,
    name: p.name,
    selectedPlayerId: p.selectedPlayerId ?? null,
    selectedPlayerName: p.selectedPlayerId
      ? idToName.get(p.selectedPlayerId) ?? null
      : null,
  }));
  return NextResponse.json({ players: rows });
}
