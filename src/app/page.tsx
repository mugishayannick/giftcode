"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SearchableCombobox,
  type ComboboxOption,
} from "@/components/SearchableCombobox";
import { formatDisplayName } from "@/lib/format";

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
  const [searchKey, setSearchKey] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [choiceSaved, setChoiceSaved] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const [takenIds, setTakenIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [playersRes, takenRes] = await Promise.all([
          fetch("/api/names", { cache: "no-store" }),
          fetch("/api/taken", { cache: "no-store" }),
        ]);
        const playersData = await playersRes.json();
        const takenData = await takenRes.json();
        setPlayers(playersData.players ?? []);
        setTakenIds(Array.isArray(takenData.ids) ? takenData.ids : []);
      } catch {
        setError("Failed to load players");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const availableNumbers = useMemo(() => {
    const all = players.map((p) => p.id);
    if (!currentPlayer) return all.filter((n) => !takenIds.includes(n));
    return all.filter((n) => n !== currentPlayer.id && !takenIds.includes(n));
  }, [players, currentPlayer, takenIds]);

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
      if (!res.ok) {
        if (res.status === 409) {
          try {
            const takenRes = await fetch("/api/taken", { cache: "no-store" });
            const takenData = await takenRes.json();
            setTakenIds(Array.isArray(takenData.ids) ? takenData.ids : []);
            setTarget(null);
          } catch {}
        }
        throw new Error(data.error || "Save failed");
      }
      setChoiceSaved(true);
      if (target != null)
        setTakenIds((prev) =>
          prev.includes(target) ? prev : [...prev, target]
        );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Save failed";
      setError(message);
    }
  }

  function handleBack() {
    setTarget(null);
    setChoiceSaved(false);
    setCurrentPlayer(null);
    setError(null);
    setSelectedName("");
    setSearchKey((k) => k + 1);
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
                    key={searchKey}
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
                  Hello, {formatDisplayName(currentPlayer.name)}
                </h2>
              </div>
            </div>

            {!choiceSaved ? (
              <div className="mt-4">
                <p className="mb-2">Pick a number</p>
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
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700"
                    onClick={handleBack}
                  >
                    Back
                  </button>
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
              <div className="mt-4">
                <div className="p-3 rounded bg-green-100 text-green-800 text-sm">
                  Your choice has been saved. Thank you!
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700"
                    onClick={handleBack}
                  >
                    Back to search
                  </button>
                </div>
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
