"use client";

import { useEffect, useState } from "react";

type Row = {
  id: number;
  name: string;
  selectedPlayerId: number | null;
  selectedPlayerName: string | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [namesText, setNamesText] = useState("");
  const [count, setCount] = useState<number | null>(null);

  async function login() {
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
    } else {
      setAuthed(true);
      await refresh();
      await refreshCount();
    }
  }

  async function refresh() {
    const res = await fetch("/api/admin/players", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load players");
      return;
    }
    setRows(data.players ?? []);
  }

  async function refreshCount() {
    const res = await fetch("/api/admin/seed", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setCount(data.count);
  }

  async function seed() {
    setError(null);
    const names = namesText
      .split(/\n|,/) // newline or comma separated
      .map((n) => n.trim())
      .filter(Boolean);
    const res = await fetch("/api/admin/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Seed failed");
      return;
    }
    setNamesText("");
    await refresh();
    await refreshCount();
  }

  useEffect(() => {
    if (authed) {
      refresh();
      refreshCount();
    }
  }, [authed]);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Admin</h1>

        {!authed ? (
          <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Password"
                className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 p-2 bg-white dark:bg-neutral-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                onClick={login}
                disabled={!password}
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Seed Players</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Paste 55 names (one per line or comma-separated). This will
                reset the list.
              </p>
              <textarea
                className="w-full h-32 rounded border border-neutral-300 dark:border-neutral-700 p-2 bg-white dark:bg-neutral-900"
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                  onClick={seed}
                  disabled={!namesText.trim()}
                >
                  Seed names
                </button>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Current count: {count ?? "-"}
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-x-auto">
              <h2 className="text-lg font-semibold mb-3">Players</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Selected #</th>
                    <th className="py-2 pr-4">Selected Name</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="py-2 pr-4 font-semibold">{r.id}</td>
                      <td className="py-2 pr-4">{r.name}</td>
                      <td className="py-2 pr-4">{r.selectedPlayerId ?? ""}</td>
                      <td className="py-2 pr-4">
                        {r.selectedPlayerName ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
