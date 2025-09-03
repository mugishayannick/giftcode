"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SearchableCombobox,
  type ComboboxOption,
} from "@/components/SearchableCombobox";

type Player = {
  id: number;
  name: string;
  selectedPlayerId?: number | null;
};

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [choiceSaved, setChoiceSaved] = useState(false);
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/names", { cache: "no-store" });
        const data = await res.json();
        setPlayers(data.players ?? []);
      } catch {
        setError("Failed to load players");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const availableNumbers = useMemo(() => {
    if (!currentPlayer) return players.map((p) => p.id);
    return players.map((p) => p.id).filter((n) => n !== currentPlayer.id);
  }, [players, currentPlayer]);

  const shuffledNumbers = useMemo(() => {
    const arr = [...availableNumbers];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [availableNumbers]);

  async function handleLogin() {
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setCurrentPlayer(data.player);
      setChoiceSaved(Boolean(data.player.selectedPlayerId));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
    }
  }

  async function handleSelect() {
    if (!currentPlayer || target == null) return;
    setError(null);
    try {
      const res = await fetch("/api/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          selectedPlayerId: target,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setChoiceSaved(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Save failed";
      setError(message);
    }
  }

  const options: ComboboxOption[] = useMemo(() => {
    const arr: ComboboxOption[] = players.map((p) => ({
      value: p.name,
      label: p.name,
    }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [players]);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          GiftCode 🎁
        </h1>

        {!currentPlayer && (
          <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Select your name</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableCombobox
                    options={options}
                    value={selectedName}
                    onChange={setSelectedName}
                    placeholder="Search your name..."
                    emptyText="No matching names"
                  />
                </div>
                <button
                  className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                  onClick={handleLogin}
                  disabled={!selectedName}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {currentPlayer && (
          <div className="bg-white/50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Hello, {currentPlayer.name}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Your number is
                </p>
              </div>
              <div className="text-4xl font-black">{currentPlayer.id}</div>
            </div>

            {!choiceSaved ? (
              <div className="mt-4">
                <p className="mb-2">Pick a number (not your own):</p>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {shuffledNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => setTarget(n)}
                      className={`aspect-square rounded border text-lg font-semibold flex items-center justify-center transition ${
                        target === n
                          ? "bg-black text-white border-black"
                          : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                      }`}
                    >
                      <span className="mr-1">{n}</span>
                      <span aria-hidden>🎁</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                    onClick={handleSelect}
                    disabled={target == null}
                  >
                    Save choice
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded bg-green-100 text-green-800 text-sm">
                Your choice has been saved. Thank you!
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="text-center text-sm text-neutral-500">
          <a className="underline" href="/admin">
            Admin
          </a>
        </div>
      </div>
    </main>
  );
}
