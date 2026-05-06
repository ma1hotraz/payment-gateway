"use client";

import { forwardRef } from "react";
import type { CardType } from "@/types";
import { formatCardNumberDisplay } from "@/utils/formatCardNumber";

interface CardInputProps {
  id: string;
  valueDigits: string;
  onDigitsChange: (digits: string) => void;
  maxDigits: number;
  disabled?: boolean;
  ariaDescribedBy?: string;
  invalid?: boolean;
  autoComplete?: string;
  placeholder?: string;
  cardType: CardType;
  onBlur?: () => void;
}

export const CardInput = forwardRef<HTMLInputElement, CardInputProps>(
  function CardInput(
    {
      id,
      valueDigits,
      onDigitsChange,
      maxDigits,
      disabled,
      ariaDescribedBy,
      invalid,
      autoComplete = "cc-number",
      placeholder,
      cardType,
      onBlur,
    },
    ref,
  ) {
    const display = formatCardNumberDisplay(valueDigits.slice(0, maxDigits));

    return (
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid === true}
        aria-describedby={ariaDescribedBy}
        spellCheck={false}
        autoCorrect="off"
        value={display}
        onBlur={onBlur}
        maxLength={cardType === "amex" ? 17 : 19}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
          onDigitsChange(cleaned);
        }}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono text-sm tracking-wide text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-55"
      />
    );
  },
);
