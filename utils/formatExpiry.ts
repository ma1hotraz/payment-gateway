import { digitsOnly } from "@/utils/formatCardNumber";

/** Restricts to MM/YY with optional slash as the user types. */
export function formatExpiryMmYyInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
