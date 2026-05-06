import type { CardType } from "@/types";
import { formatCardNumberDisplay } from "@/utils/formatCardNumber";
import { CardTypeBadge } from "@/components/CardTypeBadge";

interface CardPreviewProps {
  cardType: CardType;
  cardNumberDigits: string;
  cardholderName: string;
  expiryMmYy: string;
}

export function CardPreview({
  cardType,
  cardNumberDigits,
  cardholderName,
  expiryMmYy,
}: CardPreviewProps) {
  const formatted = formatCardNumberDisplay(cardNumberDigits);
  const numberLine = formatted.length > 0 ? formatted : "•••• •••• •••• ••••";
  const nameLine =
    cardholderName.trim().length > 0
      ? cardholderName.trim().toUpperCase()
      : "CARDHOLDER NAME";
  const expLine = expiryMmYy.trim().length > 0 ? expiryMmYy.trim() : "MM/YY";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-xl motion-reduce:transition-none dark:from-zinc-950 dark:via-zinc-900 dark:to-black"
      aria-live="polite"
      aria-label="Card preview"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-white/70">
          Card preview
        </p>
        <CardTypeBadge type={cardType} />
      </div>
      <p className="mb-6 font-mono text-lg tracking-[0.2em] sm:text-xl">{numberLine}</p>
      <div className="flex items-end justify-between gap-4 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/60">Name</p>
          <p className="truncate font-medium tracking-wide">{nameLine}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/60">Expires</p>
          <p className="font-mono font-medium">{expLine}</p>
        </div>
      </div>
    </div>
  );
}
