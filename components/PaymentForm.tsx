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

const fieldWrap = "rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ";
const focusRing =
  "focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20 focus-visible:outline-none";
const disabledState = "disabled:cursor-not-allowed disabled:opacity-55";

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
      className="space-y-3.5 sm:space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled || !valid) return;
        onSubmit();
      }}
      noValidate
    >
      <div>
        <label htmlFor={ID.name} className="block">
          <span className="text-sm font-bold text-slate-900">Name on card</span>
          <span className="mt-1 block text-xs text-slate-500">Exactly as printed on the card.</span>
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
          className={`${fieldWrap} ${focusRing} ${disabledState} mt-1.5 h-11 w-full px-3.5 text-sm text-slate-900 placeholder:text-slate-400`}
        />
        {visibleError("cardholderName") ? (
          <p id={`${ID.name}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {errors.cardholderName ?? validateCardholder(values.cardholderName)}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
          <label htmlFor={ID.number} className="block">
            <span className="text-sm font-bold text-slate-900">Card number</span>
            <span className="mt-1 block text-xs text-slate-500">Digits only; spacing is formatted for you.</span>
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
          placeholder=""
        />
        {visibleError("cardNumberDigits") ? (
          <p id={ID.numberErr} className="mt-1.5 text-sm text-red-600" role="alert">
            {errors.cardNumberDigits ?? validateCardNumberDigits(values.cardNumberDigits)}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
        <div>
          <label htmlFor={ID.expiry} className="block">
            <span className="text-sm font-bold text-slate-900">Expiry</span>
            <span className="mt-1 block text-xs text-slate-500">Month and year.</span>
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
            placeholder="MM/YY"
            className={`${fieldWrap} ${focusRing} ${disabledState} mt-1.5 h-11 w-full px-3.5 font-mono text-sm text-slate-900`}
          />
          {visibleError("expiryMmYy") ? (
            <p id={ID.expiryErr} className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.expiryMmYy ?? validateExpiry(values.expiryMmYy)}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={ID.cvv} className="block">
            <span className="text-sm font-bold text-slate-900">CVV</span>
            <span className="mt-1 block text-xs text-slate-500">Security code on the back.</span>
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
            className={`${fieldWrap} ${focusRing} ${disabledState} mt-1.5 h-11 w-full px-3.5 font-mono text-sm tracking-widest text-slate-900`}
          />
          {visibleError("cvv") ? (
            <p id={ID.cvvErr} className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.cvv ?? validateCvv(values.cardNumberDigits, values.cvv)}
            </p>
          ) : null}
        </div>
      </div>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="sr-only">Amount and currency</legend>
        <div className="block">
          <span id="pay-amount-group-label" className="text-sm font-bold text-slate-900">
            Amount & currency
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">Enter the charge in major units.</span>
        </div>
        <div className="mt-1.5 grid min-w-0 grid-cols-[minmax(0,1fr)_6.5rem] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_7rem] sm:gap-4">
          <div className="min-w-0">
            <label htmlFor={ID.amount} className="sr-only">
              Amount value
            </label>
            <input
              id={ID.amount}
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={values.amount}
              onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
              aria-labelledby="pay-amount-group-label"
              aria-invalid={visibleError("amount")}
              aria-describedby={
                visibleError("amount") ? ID.amountErr : `${ID.amount}-hint`
              }
              className={`${fieldWrap} ${focusRing} ${disabledState} h-11 w-full min-w-0 px-3.5 text-sm tabular-nums text-slate-900`}
            />
            {visibleError("amount") ? (
              <p id={ID.amountErr} className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.amount ?? validateAmount(values.amount)}
              </p>
            ) : (
              <p id={`${ID.amount}-hint`} className="mt-1.5 text-xs text-slate-500">
                Mirrors the summary panel.
              </p>
            )}
          </div>
          <div className="min-w-0">
            <label htmlFor={ID.curr} className="sr-only">
              Currency
            </label>
            <CurrencySelect
              id={ID.curr}
              value={values.currency}
              disabled={disabled}
              ariaDescribedBy={
                visibleError("amount") ? ID.amountErr : `${ID.amount}-hint`
              }
              onChange={(c: CurrencyCode) => setValues((v) => ({ ...v, currency: c }))}
              ariaLabelledBy="pay-amount-group-label"
            />
          </div>
        </div>
      </fieldset>

      <button
        id="pay-submit-button"
        type="submit"
        disabled={disabled || !valid}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-[#2563eb] text-sm font-bold tracking-wide text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        Pay now
      </button>
    </form>
  );
}
