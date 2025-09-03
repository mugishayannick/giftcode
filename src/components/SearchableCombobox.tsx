"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ComboboxOption = { value: string; label: string };

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  emptyText = "No results",
}: SearchableComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const idBase = useRef(`cbx-${Math.random().toString(36).slice(2)}`).current;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(normalizedQuery)
    );
  }, [options, normalizedQuery]);

  // Keep query in sync with selected value's label
  useEffect(() => {
    const current = options.find((o) => o.value === value);
    if (!open) {
      setQuery(current ? current.label : "");
    }
  }, [value, options, open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (inputRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
      setHighlightedIndex(-1);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleSelect(opt: ComboboxOption) {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      setHighlightedIndex(0);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        Math.min(i + 1, Math.max(filtered.length - 1, 0))
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filtered[highlightedIndex];
      if (chosen) handleSelect(chosen);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500">
            🔎
          </span>
          <input
            ref={inputRef}
            type="text"
            className="w-full rounded border border-neutral-300 dark:border-neutral-700 pl-8 pr-8 py-2 bg-white dark:bg-neutral-900"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${idBase}-listbox`}
            aria-autocomplete="list"
            disabled={disabled}
          />
          {query && (
            <button
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              onClick={() => {
                setQuery("");
                onChange("");
                inputRef.current?.focus();
                setOpen(true);
                setHighlightedIndex(0);
              }}
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={`${idBase}-listbox`}
          role="listbox"
          className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-neutral-500">{emptyText}</li>
          ) : (
            filtered.map((opt, idx) => {
              const selected = value === opt.value;
              const active = highlightedIndex === idx;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  id={`${idBase}-option-${idx}`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    active
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "bg-white dark:bg-neutral-900"
                  } ${selected ? "font-semibold" : ""}`}
                >
                  {/* Hide any leading numbers to avoid implying IDs */}
                  {opt.label.replace(/^\s*\d+\s*[).\-]*\s*/, "")}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
