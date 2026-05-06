import type { CurrencyCode } from "@/types";

interface CurrencySelectProps {
  id: string;
  value: CurrencyCode;
  disabled?: boolean;
  onChange: (c: CurrencyCode) => void;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
}

export function CurrencySelect({
  id,
  value,
  disabled,
  onChange,
  ariaDescribedBy,
  ariaLabelledBy,
}: CurrencySelectProps) {
  return (
    <select
      id={id}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-55"
    >
      <option value="USD">USD</option>
      <option value="INR">INR</option>
    </select>
  );
}
