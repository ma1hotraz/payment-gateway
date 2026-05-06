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
        className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-sm tracking-wide text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
      />
    );
  },
);
