import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { Player } from "@/types/player";

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const playersCol = await getCollection<Player>("players");
  const player = await playersCol.findOne({ name }, { projection: { _id: 0 } });
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }
  return NextResponse.json({ player });
}
