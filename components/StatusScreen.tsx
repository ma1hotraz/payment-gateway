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
        className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
        aria-labelledby="payment-status-heading"
        aria-busy="true"
        aria-live="polite"
      >
        <h2
          ref={headingRef}
          id="payment-status-heading"
          tabIndex={-1}
          className="text-lg font-semibold outline-none"
        >
          Processing payment
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Please wait—we are securely completing your checkout. Slow networks may take a moment.
        </p>
        <div className="mt-4 flex items-center gap-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          <span
            className="inline-block size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 motion-reduce:animate-none motion-reduce:border-t-transparent dark:border-zinc-700 dark:border-t-zinc-100"
            aria-hidden
          />
          Processing securely…
        </div>
      </section>
    );
  }

  if (flow === "success") {
    return (
      <section
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40 sm:p-6"
        aria-labelledby="payment-status-heading"
        aria-live="polite"
      >
        <h2
          ref={headingRef}
          id="payment-status-heading"
          tabIndex={-1}
          className="text-lg font-semibold text-emerald-900 outline-none dark:text-emerald-100"
        >
          Payment successful
        </h2>
        <p className="mt-2 text-sm text-emerald-900/90 dark:text-emerald-100/90">
          {message ?? "Your payment completed successfully (simulated)."}
        </p>
        <button
          ref={primaryRef}
          type="button"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-900 px-4 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 dark:bg-emerald-100 dark:text-emerald-950 dark:focus-visible:outline-emerald-100"
          onClick={onAfterSuccess}
        >
          Pay another amount
        </button>
      </section>
    );
  }

  const isTimeout = flow === "timeout";

  return (
    <section
      className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900/60 dark:bg-red-950/30 sm:p-6"
      aria-labelledby="payment-status-heading"
      aria-live="assertive"
    >
      <h2
        ref={headingRef}
        id="payment-status-heading"
        tabIndex={-1}
        className="text-lg font-semibold text-red-900 outline-none dark:text-red-50"
      >
        {isTimeout ? "Payment timed out" : "Payment failed"}
      </h2>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-red-900/80 dark:text-red-100/80">
        Attempt {Math.min(currentAttempt, maxPaymentAttempts)} of {maxPaymentAttempts}
      </p>
      <p className="mt-2 text-sm text-red-900 dark:text-red-100">{message ?? "Something went wrong."}</p>

      {!attemptsExhausted ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {retryAllowed ? (
            <button
              ref={primaryRef}
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-red-900 px-4 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900 dark:bg-red-100 dark:text-red-950 dark:focus-visible:outline-red-100"
              onClick={onRetry}
            >
              Try again
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-red-900/30 bg-white px-4 text-sm font-semibold text-red-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900 dark:bg-red-950 dark:text-red-50 dark:focus-visible:outline-red-100"
            onClick={onStartNewPayment}
          >
            Start over
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-red-950 dark:text-red-100">
            Maximum attempts reached for this transaction. Please start a new payment or try a different card.
          </p>
          <button
            ref={primaryRef}
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-red-900 px-4 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900 dark:bg-red-100 dark:text-red-950 dark:focus-visible:outline-red-100"
            onClick={onStartNewPayment}
          >
            Start new payment
          </button>
        </div>
      )}
    </section>
  );
}
