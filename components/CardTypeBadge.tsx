import type { CardType } from "@/types";

const LABEL: Record<CardType, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  unknown: "Card",
};

export function CardTypeBadge({ type }: { type: CardType }) {
  const label = LABEL[type];
  return (
    <span
      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
      aria-label={type === "unknown" ? "Card network" : `${label}`}
    >
      {label}
    </span>
  );
}
