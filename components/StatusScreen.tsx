"use client";

import { useEffect, useRef } from "react";
import type { PaymentFlowStatus } from "@/types";
import { maxPaymentAttempts, usePaymentStore } from "@/store/usePaymentStore";

interface StatusScreenProps {
  flow: PaymentFlowStatus;
  message: string | null;
  onRetry: () => void;
  onStartNewPayment: () => void;
  onAfterSuccess: () => void;
}

const panel =
  "rounded-2xl border bg-white px-6 py-6 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] ";

export function StatusScreen({
  flow,
  message,
  onRetry,
  onStartNewPayment,
  onAfterSuccess,
}: StatusScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  const currentAttempt = usePaymentStore((s) => s.currentAttempt);

  const retryAllowed =
    (flow === "failed" || flow === "timeout") && currentAttempt < maxPaymentAttempts;

  const attemptsExhausted =
    (flow === "failed" || flow === "timeout") && currentAttempt >= maxPaymentAttempts;

  useEffect(() => {
    if (flow === "idle") return;
    window.requestAnimationFrame(() => {
      primaryRef.current?.focus();
      if (!primaryRef.current) headingRef.current?.focus();
    });
  }, [flow]);

  if (flow === "idle") {
    return null;
  }

  if (flow === "processing") {
    return (
      <section
        className={`${panel} border-slate-200/90`}
        aria-labelledby="payment-status-heading"
        aria-busy="true"
        aria-live="polite"
      >
        <h2
          ref={headingRef}
          id="payment-status-heading"
          tabIndex={-1}
          className="text-lg font-bold text-slate-900 outline-none"
        >
          Processing payment
        </h2>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Attempt {Math.min(currentAttempt, maxPaymentAttempts)} of {maxPaymentAttempts}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Confirming details with your card issuer—this can take up to a few seconds on slower connections.
        </p>
        <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
          <span
            className="inline-block size-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#2563eb] motion-reduce:animate-none motion-reduce:border-t-transparent"
            aria-hidden
          />
          Please wait…
        </div>
      </section>
    );
  }

  if (flow === "success") {
    return (
      <section
        className={`${panel} border-emerald-200 bg-emerald-50/70`}
        aria-labelledby="payment-status-heading"
        aria-live="polite"
      >
        <h2
          ref={headingRef}
          id="payment-status-heading"
          tabIndex={-1}
          className="text-lg font-bold text-emerald-950 outline-none"
        >
          Payment confirmed
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
          {message ?? "Your payment completed successfully."}
        </p>
        <button
          ref={primaryRef}
          type="button"
          className="mt-5 inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          onClick={onAfterSuccess}
        >
          New payment
        </button>
      </section>
    );
  }

  const isTimeout = flow === "timeout";

  return (
    <section
      className={`${panel} border-red-200 bg-red-50/80`}
      aria-labelledby="payment-status-heading"
      aria-live="assertive"
    >
      <h2
        ref={headingRef}
        id="payment-status-heading"
        tabIndex={-1}
        className="text-lg font-bold text-red-950 outline-none"
      >
        {isTimeout ? "Request timed out" : "Payment declined"}
      </h2>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-red-800/85">
        Attempt {Math.min(currentAttempt, maxPaymentAttempts)} of {maxPaymentAttempts}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-red-950">{message ?? "Unable to complete this payment."}</p>

      {!attemptsExhausted ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {retryAllowed ? (
            <button
              ref={primaryRef}
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-bold text-white shadow-md shadow-blue-600/25 hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              onClick={onRetry}
            >
              Try again
            </button>
          ) : null}
          <button
            type="button"
            className={`inline-flex h-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400`}
            onClick={onStartNewPayment}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium text-red-950">
            This payment could not be completed after multiple attempts. Use a different card or contact your bank.
          </p>
          <button
            ref={primaryRef}
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-bold text-white shadow-md hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
            onClick={onStartNewPayment}
          >
            Start over
          </button>
        </div>
      )}
    </section>
  );
}
