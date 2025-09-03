import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCollection, getDb } from "@/lib/mongodb";
import type { Player } from "@/types/player";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { names } = await request.json();
  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json(
      { error: "names must be a non-empty array" },
      { status: 400 }
    );
  }
  const cleanNames = names
    .map((n) => (typeof n === "string" ? n.trim() : ""))
    .filter((n) => n.length > 0);
  if (cleanNames.length === 0) {
    return NextResponse.json(
      { error: "No valid names provided" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const col = await getCollection<Player>("players");
  await db
    .collection("players")
    .drop()
    .catch(() => {});
  await col.createIndex({ id: 1 }, { unique: true });
  await col.createIndex({ name: 1 }, { unique: true });

  const docs: Player[] = cleanNames.map((name, idx) => ({ id: idx + 1, name }));
  await col.insertMany(docs);
  return NextResponse.json({ ok: true, count: docs.length });
}

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const col = await getCollection<Player>("players");
  const count = await col.countDocuments();
  return NextResponse.json({ count });
}
