import type { CardType } from "@/types";

/** Detect card scheme from PAN prefix (digits only). */
export function detectCardType(panDigits: string): CardType {
  const d = panDigits.replace(/\D/g, "");
  if (d.length === 0) return "unknown";

  if (d.startsWith("4")) return "visa";

  if (d.startsWith("34") || d.startsWith("37")) return "amex";

  if (/^5[1-5]/.test(d)) return "mastercard";

  if (d.startsWith("2")) {
    const six = d.slice(0, 6);
    const n6 = six.length >= 6 ? Number.parseInt(six, 10) : NaN;
    if (!Number.isNaN(n6) && n6 >= 222100 && n6 <= 272099) return "mastercard";
  }

  return "unknown";
}

export function getExpectedPanLength(cardType: CardType): number {
  if (cardType === "amex") return 15;
  return 16;
}

export function getExpectedCvvLength(cardType: CardType): number {
  return cardType === "amex" ? 4 : 3;
}

export function isValidLuhn(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  if (d.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i -= 1) {
    let n = Number.parseInt(d[i] ?? "0", 10);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}
