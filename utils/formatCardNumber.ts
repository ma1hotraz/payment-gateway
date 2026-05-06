import { detectCardType, getExpectedPanLength } from "@/utils/card";

/** Strip to digits only. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Format PAN for display. Amex uses 4-6-5; others use 4×4.
 */
export function formatCardNumberDisplay(panDigits: string): string {
  const d = digitsOnly(panDigits);
  const type = detectCardType(d);
  const maxLen = getExpectedPanLength(type);
  const trimmed = d.slice(0, maxLen);

  if (type === "amex") {
    const a = trimmed.slice(0, 4);
    const b = trimmed.slice(4, 10);
    const c = trimmed.slice(10, 15);
    return [a, b, c].filter(Boolean).join(" ");
  }

  return trimmed.replace(/(.{4})/g, "$1 ").trim();
}
