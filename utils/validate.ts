import type { CurrencyCode, PaymentFormFieldErrors, PaymentFormValues } from "@/types";
import {
  detectCardType,
  getExpectedCvvLength,
  getExpectedPanLength,
  isValidLuhn,
} from "@/utils/card";
import { digitsOnly } from "@/utils/formatCardNumber";

function parseExpiry(month: number, yearTwoDigit: number): Date {
  const yearFull = 2000 + yearTwoDigit;
  return new Date(yearFull, month, 0, 23, 59, 59, 999);
}

/** Expiry is valid if strictly after end of current calendar month (local). */
export function isExpiryValid(mmYy: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmYy.trim());
  if (!m) return false;
  const mm = Number.parseInt(m[1] ?? "", 10);
  const yy = Number.parseInt(m[2] ?? "", 10);
  if (Number.isNaN(mm) || Number.isNaN(yy)) return false;
  if (mm < 1 || mm > 12) return false;

  const now = new Date();
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const expiryEnd = parseExpiry(mm, yy);
  return expiryEnd.getTime() > endOfThisMonth.getTime();
}

export function validateAmount(amountStr: string): string | undefined {
  const trimmed = amountStr.trim();
  if (!trimmed) return "Enter an amount.";
  const n = Number.parseFloat(trimmed);
  if (Number.isNaN(n)) return "Enter a valid number.";
  if (n <= 0) return "Amount must be greater than zero.";
  if (n > 1_000_000) return "Amount is too large.";
  return undefined;
}

export function validateExpiry(mmYy: string): string | undefined {
  const t = mmYy.trim();
  if (!t) return "Enter expiry.";
  if (!/^(\d{2})\/(\d{2})$/.test(t)) return "Use MM/YY.";
  if (!isExpiryValid(t)) return "Expiry cannot be in the past.";
  return undefined;
}

export function validateCardholder(name: string): string | undefined {
  const n = name.trim();
  if (n.length < 2) return "Enter the cardholder name.";
  if (n.length > 80) return "Name is too long.";
  if (!/^[\p{L}\s'\-.]+$/u.test(n))
    return "Use letters and common name characters only.";
  return undefined;
}

export function validateCardNumberDigits(pan: string): string | undefined {
  const d = digitsOnly(pan);
  if (!d) return "Enter the card number.";
  const type = detectCardType(d);
  const expected = getExpectedPanLength(type);
  if (d.length < expected) return `Enter all ${expected} digits.`;
  if (type === "unknown") return "Unsupported or unknown card type.";
  if (!isValidLuhn(d)) return "Card number appears invalid.";
  return undefined;
}

export function validateCvv(cardNumberDigits: string, cvv: string): string | undefined {
  const c = digitsOnly(cvv);
  if (!c) return "Enter the CVV.";
  const type = detectCardType(digitsOnly(cardNumberDigits));
  const len = getExpectedCvvLength(type);
  if (c.length !== len) return `CVV must be ${len} digits for this card.`;
  return undefined;
}

export function buildFieldErrors(v: PaymentFormValues): PaymentFormFieldErrors {
  return {
    cardholderName: validateCardholder(v.cardholderName),
    cardNumberDigits: validateCardNumberDigits(v.cardNumberDigits),
    expiryMmYy: validateExpiry(v.expiryMmYy),
    cvv: validateCvv(v.cardNumberDigits, v.cvv),
    amount: validateAmount(v.amount),
    currency: isCurrencySupported(v.currency) ? undefined : "Choose a currency.",
  };
}

function isCurrencySupported(c: CurrencyCode): boolean {
  return c === "INR" || c === "USD";
}

export function isFormFullyValid(values: PaymentFormValues): boolean {
  const e = buildFieldErrors(values);
  return (
    !e.cardholderName &&
    !e.cardNumberDigits &&
    !e.expiryMmYy &&
    !e.cvv &&
    !e.amount &&
    !e.currency
  );
}
