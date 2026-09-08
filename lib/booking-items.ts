export const SPECIAL_SYMBOL_IDS = ["AMPERSAND", "HEART", "RING"] as const;

export type SpecialSymbolId = (typeof SPECIAL_SYMBOL_IDS)[number];

export const SPECIAL_SYMBOLS: Record<
  SpecialSymbolId,
  { label: string; price: number }
> = {
  AMPERSAND: { label: "Ampersand", price: 55 },
  HEART: { label: "Heart", price: 55 },
  RING: { label: "Ring", price: 55 },
};

const symbolIdSet = new Set<string>(SPECIAL_SYMBOL_IDS);

export function normalizeSelectedSymbols(value: unknown): SpecialSymbolId[] {
  let candidates: unknown[] = [];
  if (Array.isArray(value)) candidates = value;
  else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      candidates = Array.isArray(parsed) ? parsed : value.split(",");
    } catch {
      candidates = value.split(",");
    }
  }
  return [...new Set(candidates.map(String).filter((id) => symbolIdSet.has(id)))] as SpecialSymbolId[];
}

export function calculateBookingItems(
  phraseValue: unknown,
  selectedSymbolsValue: unknown,
) {
  const rawPhrase = String(phraseValue || "").toUpperCase();
  const selectedSymbols = normalizeSelectedSymbols(selectedSymbolsValue);
  const manuallyEnteredAmpersand = rawPhrase.includes("&");
  if (manuallyEnteredAmpersand && !selectedSymbols.includes("AMPERSAND"))
    selectedSymbols.push("AMPERSAND");

  const withoutAmpersand = rawPhrase.replaceAll("&", "");
  const phrase = withoutAmpersand.replace(/[^A-Z0-9 ]/g, "");
  const letters = phrase.replaceAll(" ", "").split("").filter(Boolean);
  const counts: Record<string, number> = {};
  letters.forEach((item) => (counts[item] = (counts[item] || 0) + 1));
  const shortage = Object.entries(counts).find(([, count]) => count > 2);
  const letterCount = letters.length;
  const symbolCount = selectedSymbols.length;
  const totalItems = letterCount + symbolCount;
  const subtotal =
    letterCount * 55 +
    selectedSymbols.reduce((sum, id) => sum + SPECIAL_SYMBOLS[id].price, 0);
  const discount = totalItems >= 4 ? subtotal * 0.1 : 0;

  return {
    phrase,
    letters,
    selectedSymbols,
    letterCount,
    symbolCount,
    totalItems,
    subtotal,
    discount,
    rental: subtotal - discount,
    shortage,
    invalid: withoutAmpersand !== phrase,
    manuallyEnteredAmpersand,
  };
}

export function symbolNames(symbols: unknown) {
  return normalizeSelectedSymbols(symbols).map((id) => SPECIAL_SYMBOLS[id].label);
}

export function selectionName(phrase: unknown, symbols: unknown) {
  const parts = [String(phrase || "").trim(), ...symbolNames(symbols)].filter(Boolean);
  return parts.join(" + ");
}

export function selectionCountLabel(letterCount: number, symbolCount: number) {
  const parts: string[] = [];
  if (letterCount)
    parts.push(`${letterCount} ${letterCount === 1 ? "letter" : "letters"}`);
  if (symbolCount)
    parts.push(
      `${symbolCount} special ${symbolCount === 1 ? "symbol" : "symbols"}`,
    );
  return parts.join(" + ");
}
