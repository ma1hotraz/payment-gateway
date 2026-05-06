import type { CardType } from "@/types";
import { formatCardNumberDisplay } from "@/utils/formatCardNumber";

interface CardPreviewProps {
  cardType: CardType;
  cardNumberDigits: string;
  cardholderName: string;
  expiryMmYy: string;
}

function CardNetworkMark({ type }: { type: CardType }) {
  if (type === "visa") {
    return (
      <span className="text-[22px] font-bold italic tracking-tighter text-[#1a1f71]" aria-hidden>
        VISA
      </span>
    );
  }
  if (type === "mastercard") {
    return (
      <span className="flex items-center" aria-hidden>
        <span className="relative flex h-[26px] w-[34px]">
          <span className="absolute left-0 top-1 size-5 rounded-full bg-[#eb001b] opacity-95" />
          <span className="absolute left-3 top-1 size-5 rounded-full bg-[#f79e1b]" />
        </span>
      </span>
    );
  }
  if (type === "amex") {
    return (
      <span className="text-lg font-semibold tracking-tight text-[#006fcf]" aria-hidden>
        AMEX
      </span>
    );
  }
  return (
    <span className="rounded border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-500">
      Card
    </span>
  );
}

export function CardPreview({
  cardType,
  cardNumberDigits,
  cardholderName,
  expiryMmYy,
}: CardPreviewProps) {
  const formatted = formatCardNumberDisplay(cardNumberDigits);
  const numberLine =
    formatted.length > 0 ? formatted : "•••• •••• •••• ••••";

  const nameLine =
    cardholderName.trim().length > 0
      ? cardholderName.trim().toUpperCase()
      : "YOUR NAME HERE";
  const expLine = expiryMmYy.trim().length > 0 ? expiryMmYy.trim() : "MM/YY";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white bg-white p-4 text-slate-800 shadow-[0_14px_40px_-12px_rgba(15,23,42,0.16)] motion-reduce:transition-none sm:p-5"
      aria-live="polite"
      aria-label="Payment card preview"
      style={{
        backgroundImage:
          "linear-gradient(145deg, #ffffff 0%, #f8fafc 45%, #f1f5f9 100%)",
      }}
    >
      {/* subtle top notch */}
      <div className="absolute left-1/2 top-0 h-3 w-[42%] -translate-x-1/2 rounded-b-lg bg-blue-600/85" />

      <div className="mb-4 flex justify-end pt-3 sm:mb-5 sm:pt-4">
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-1.5 py-0.5 shadow-sm backdrop-blur-sm sm:gap-2 sm:px-2 sm:py-1">
          {/* chip */}
          <span
            className="relative h-8 w-[44px] overflow-hidden rounded-md border border-amber-200/70 bg-gradient-to-br from-[#e8cfa8] via-[#d4af7a] to-[#c9a66b] sm:h-9 sm:w-[50px]"
            aria-hidden
          >
            <span className="absolute inset-2 rounded-[2px] border border-amber-900/25" />
            <span className="absolute left-2 top-1/2 h-3 w-[2px] -translate-y-1/2 bg-amber-900/20" />
          </span>
          {/* contactless */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-slate-400 sm:h-[26px] sm:w-[26px]" aria-hidden>
            <path
              d="M8.5 8.5c2.76 2 2.76 7 0 9M11 7c4 3 4 13 0 16M13.5 6c5.5 3.5 5.5 15.5 0 19"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <p className="mb-4 font-mono text-base font-medium tracking-[0.12em] text-slate-800 sm:mb-5 sm:text-lg">
        {numberLine}
      </p>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Name on card</p>
          <p className="mt-1 truncate text-sm font-semibold tracking-wide text-slate-900">{nameLine}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Expiry</p>
          <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{expLine}</p>
        </div>
        <div className="shrink-0 self-end pb-0.5">
          <CardNetworkMark type={cardType} />
        </div>
      </div>
    </div>
  );
}
