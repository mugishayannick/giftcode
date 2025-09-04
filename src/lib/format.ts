export function formatDisplayName(name: string): string {
  if (!name) return "";
  // Remove common numeric prefixes like: "1. ", "(2) ", "3 - ", "4: ", "05) - ", etc.
  return name
    .replace(/^\s*[\(\[]?\s*\d+\s*[\)\]]?\s*[:.\-–—)]*\s*/u, "")
    .trim();
}
