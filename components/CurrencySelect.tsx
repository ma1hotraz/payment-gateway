import type { CurrencyCode } from "@/types";

interface CurrencySelectProps {
  id: string;
  value: CurrencyCode;
  disabled?: boolean;
  onChange: (c: CurrencyCode) => void;
  ariaDescribedBy?: string;
}

export function CurrencySelect({
  id,
  value,
  disabled,
  onChange,
  ariaDescribedBy,
}: CurrencySelectProps) {
  return (
    <select
      id={id}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
      className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
    >
      <option value="USD">USD</option>
      <option value="INR">INR</option>
    </select>
  );
}
