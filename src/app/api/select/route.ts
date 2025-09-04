import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { Player } from "@/types/player";

export async function POST(request: Request) {
  const { playerId, selectedPlayerId } = await request.json();
  if (
    typeof playerId !== "number" ||
    typeof selectedPlayerId !== "number" ||
    playerId < 1 ||
    selectedPlayerId < 1
  ) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }
  if (playerId === selectedPlayerId) {
    return NextResponse.json(
      { error: "Cannot select yourself" },
      { status: 400 }
    );
  }

  const playersCol = await getCollection<Player>("players");
  const player = await playersCol.findOne({ id: playerId });
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }
  if (player.selectedPlayerId) {
    return NextResponse.json(
      { error: "Choice already saved" },
      { status: 409 }
    );
  }

  const selectedExists = await playersCol.findOne({ id: selectedPlayerId });
  if (!selectedExists) {
    return NextResponse.json(
      { error: "Selected player not found" },
      { status: 404 }
    );
  }
  // Ensure target hasn't been taken already
  const alreadyTaken = await playersCol.findOne({ selectedPlayerId });
  if (alreadyTaken) {
    return NextResponse.json(
      { error: "This player has already been selected by someone else" },
      { status: 409 }
    );
  }

  let result;
  try {
    result = await playersCol.updateOne(
      { id: playerId, selectedPlayerId: { $exists: false } },
      { $set: { selectedPlayerId } }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "This player has already been selected by someone else" },
      { status: 409 }
    );
  }

  if (!result.modifiedCount) {
    return NextResponse.json(
      { error: "Choice already saved" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
