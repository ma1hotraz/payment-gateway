"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CurrencyCode, PaymentFormValues, TouchedFields } from "@/types";
import { CardInput } from "@/components/CardInput";
import { CardTypeBadge } from "@/components/CardTypeBadge";
import { CurrencySelect } from "@/components/CurrencySelect";
import { detectCardType, getExpectedPanLength } from "@/utils/card";
import { formatExpiryMmYyInput } from "@/utils/formatExpiry";
import type { PaymentFormFieldErrors } from "@/types";
import {
  validateAmount,
  validateCardholder,
  validateCardNumberDigits,
  validateCvv,
  validateExpiry,
} from "@/utils/validate";

interface PaymentFormProps {
  disabled: boolean;
  values: PaymentFormValues;
  setValues: Dispatch<SetStateAction<PaymentFormValues>>;
  setTouched: Dispatch<SetStateAction<TouchedFields>>;
  errors: PaymentFormFieldErrors;
  visibleError: (field: keyof PaymentFormValues) => boolean;
  valid: boolean;
  onSubmit: () => void;
}

const ID = {
  name: "pay-card-name",
  number: "pay-card-number",
  numberErr: "pay-card-number-error",
  expiry: "pay-expiry",
  expiryErr: "pay-expiry-error",
  cvv: "pay-cvv",
  cvvErr: "pay-cvv-error",
  amount: "pay-amount",
  amountErr: "pay-amount-error",
  curr: "pay-currency",
} as const;

export function PaymentForm({
  disabled,
  values,
  setValues,
  setTouched,
  errors,
  visibleError,
  valid,
  onSubmit,
}: PaymentFormProps) {
  const cardType = detectCardType(values.cardNumberDigits);
  const panLen = getExpectedPanLength(cardType);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled || !valid) return;
        onSubmit();
      }}
      noValidate
    >
      <div>
        <label htmlFor={ID.name} className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Cardholder name
        </label>
        <input
          id={ID.name}
          type="text"
          name="cc-name"
          autoComplete="cc-name"
          disabled={disabled}
          value={values.cardholderName}
          onChange={(e) => setValues((v) => ({ ...v, cardholderName: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, cardholderName: true }))}
          aria-invalid={visibleError("cardholderName")}
          aria-describedby={visibleError("cardholderName") ? `${ID.name}-error` : undefined}
          className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
        />
        {visibleError("cardholderName") ? (
          <p id={`${ID.name}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.cardholderName ?? validateCardholder(values.cardholderName)}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={ID.number} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Card number
          </label>
          <CardTypeBadge type={cardType} />
        </div>
        <CardInput
          id={ID.number}
          valueDigits={values.cardNumberDigits}
          maxDigits={panLen}
          cardType={cardType}
          disabled={disabled}
          invalid={visibleError("cardNumberDigits")}
          ariaDescribedBy={visibleError("cardNumberDigits") ? ID.numberErr : undefined}
          onBlur={() => setTouched((t) => ({ ...t, cardNumberDigits: true }))}
          onDigitsChange={(d) =>
            setValues((v) => ({
              ...v,
              cardNumberDigits: d,
              cvv: "",
            }))
          }
          placeholder="4242 4242 4242 4242"
        />
        {visibleError("cardNumberDigits") ? (
          <p id={ID.numberErr} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.cardNumberDigits ?? validateCardNumberDigits(values.cardNumberDigits)}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ID.expiry} className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Expiry (MM/YY)
          </label>
          <input
            id={ID.expiry}
            type="text"
            inputMode="numeric"
            name="cc-exp"
            autoComplete="cc-exp"
            disabled={disabled}
            value={values.expiryMmYy}
            onChange={(e) =>
              setValues((v) => ({ ...v, expiryMmYy: formatExpiryMmYyInput(e.target.value) }))
            }
            onBlur={() => setTouched((t) => ({ ...t, expiryMmYy: true }))}
            aria-invalid={visibleError("expiryMmYy")}
            aria-describedby={visibleError("expiryMmYy") ? ID.expiryErr : undefined}
            placeholder="12/28"
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-sm text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
          />
          {visibleError("expiryMmYy") ? (
            <p id={ID.expiryErr} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.expiryMmYy ?? validateExpiry(values.expiryMmYy)}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={ID.cvv} className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            CVV
          </label>
          <input
            id={ID.cvv}
            type="password"
            inputMode="numeric"
            name="cc-csc"
            autoComplete="cc-csc"
            disabled={disabled}
            value={values.cvv}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                cvv: e.target.value.replace(/\D/g, "").slice(0, cardType === "amex" ? 4 : 3),
              }))
            }
            onBlur={() => setTouched((t) => ({ ...t, cvv: true }))}
            aria-invalid={visibleError("cvv")}
            aria-describedby={visibleError("cvv") ? ID.cvvErr : undefined}
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-sm text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
          />
          {visibleError("cvv") ? (
            <p id={ID.cvvErr} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.cvv ?? validateCvv(values.cardNumberDigits, values.cvv)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,minmax(0,9rem)] sm:items-end">
            <div>
              <label htmlFor={ID.amount} className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Amount
              </label>
              <input
                id={ID.amount}
                type="text"
                inputMode="decimal"
                disabled={disabled}
                value={values.amount}
                onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                aria-invalid={visibleError("amount")}
                aria-describedby={
                  visibleError("amount") ? ID.amountErr : `${ID.amount}-hint`
                }
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-200"
              />
              {visibleError("amount") ? (
                <p id={ID.amountErr} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.amount ?? validateAmount(values.amount)}
                </p>
              ) : (
                <p id={`${ID.amount}-hint`} className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Major units (e.g. 49.99)
                </p>
              )}
            </div>
            <div>
              <label htmlFor={ID.curr} className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Currency
              </label>
              <CurrencySelect
                id={ID.curr}
                value={values.currency}
                disabled={disabled}
                ariaDescribedBy={`${ID.amount}-hint`}
                onChange={(c: CurrencyCode) => setValues((v) => ({ ...v, currency: c }))}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        id="pay-submit-button"
        type="submit"
        disabled={disabled || !valid}
        className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-400 motion-safe:transition dark:bg-zinc-100 dark:text-zinc-900 dark:focus-visible:outline-zinc-200 dark:disabled:bg-zinc-600"
      >
        Pay securely
      </button>
    </form>
  );
}
