import type { CardType } from "@/types";

const LABEL: Record<CardType, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  unknown: "Card",
};

export function CardTypeBadge({ type }: { type: CardType }) {
  const label = LABEL[type];
  if (type === "unknown") {
    return (
      <span
        className="inline-flex rounded-md border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:border-zinc-600"
        aria-label="Unknown card brand"
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className="inline-flex rounded-md bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white motion-safe:transition-colors dark:bg-zinc-100 dark:text-zinc-900"
      aria-label={`${label} card`}
    >
      {label}
    </span>
  );
}
