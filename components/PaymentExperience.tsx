"use client";

import { CardPreview } from "@/components/CardPreview";
import { PaymentForm } from "@/components/PaymentForm";
import { StatusScreen } from "@/components/StatusScreen";
import { TransactionHistory } from "@/components/TransactionHistory";
import { usePaymentFormModel } from "@/hooks/usePaymentFormModel";
import { usePaymentSubmit } from "@/hooks/usePaymentSubmit";
import { maxPaymentAttempts, usePaymentStore } from "@/store/usePaymentStore";
import { detectCardType } from "@/utils/card";

export function PaymentExperience() {
  const form = usePaymentFormModel();
  const { submit } = usePaymentSubmit();

  const flow = usePaymentStore((s) => s.paymentFlow);
  const message = usePaymentStore((s) => s.lastUserMessage);
  const currentAttempt = usePaymentStore((s) => s.currentAttempt);
  const activeTransactionId = usePaymentStore((s) => s.activeTransactionId);
  const startNewPaymentSession = usePaymentStore((s) => s.startNewPaymentSession);
  const resetAfterSuccessView = usePaymentStore((s) => s.resetAfterSuccessView);
  const setPaymentFlow = usePaymentStore((s) => s.setPaymentFlow);

  const exhausted =
    (flow === "failed" || flow === "timeout") && currentAttempt >= maxPaymentAttempts;

  const showFormShell = flow === "idle" || flow === "processing";

  const formDisabled =
    flow === "processing" ||
    flow === "success" ||
    exhausted ||
    flow === "failed" ||
    flow === "timeout";

  const cardType = detectCardType(form.values.cardNumberDigits);

  const retryHintVisible =
    flow === "idle" &&
    Boolean(activeTransactionId) &&
    currentAttempt > 0 &&
    currentAttempt < maxPaymentAttempts;

  const nextAttemptNumber = retryHintVisible ? currentAttempt + 1 : null;

  return (
    <>
      <a
        href="#checkout-main"
        className="fixed left-3 top-3 z-50 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white opacity-0 focus:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 motion-safe:transition dark:bg-zinc-100 dark:text-zinc-950"
      >
        Skip to checkout
      </a>
      <main
        id="checkout-main"
        tabIndex={-1}
        className="motion-reduce:scroll-auto outline-none lg:outline-offset-8"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr),minmax(16rem,20rem)] xl:gap-14">
          <div className="space-y-6">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Test mode • Simulated processor
              </p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                Checkout
              </h1>
              <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
                Full UI lifecycle (idle → processing → result) against `/api/pay`. Sensitive card details are not posted; only identifiers and billing metadata reach the server.
              </p>
            </header>

            <CardPreview
              cardType={cardType}
              cardNumberDigits={form.values.cardNumberDigits}
              cardholderName={form.values.cardholderName}
              expiryMmYy={form.values.expiryMmYy}
            />

            <div aria-live="polite" className="space-y-4">
              <StatusScreen
                flow={flow}
                message={message}
                onRetry={() => {
                  setPaymentFlow("idle");
                  window.requestAnimationFrame(() => {
                    document.getElementById("pay-submit-button")?.focus();
                  });
                }}
                onStartNewPayment={() => {
                  startNewPaymentSession();
                  form.reset();
                }}
                onAfterSuccess={() => {
                  resetAfterSuccessView();
                  form.reset();
                }}
              />

              {showFormShell ? (
                <section
                  aria-label="Payment details form"
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
                >
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Card details</h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Double submissions are blocked while processing.
                      </p>
                    </div>
                    {nextAttemptNumber ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Next attempt {nextAttemptNumber} of {maxPaymentAttempts}
                      </p>
                    ) : flow === "processing" ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Attempt {Math.min(currentAttempt, maxPaymentAttempts)} of{" "}
                        {maxPaymentAttempts}
                      </p>
                    ) : null}
                  </div>
                  <PaymentForm
                    disabled={formDisabled}
                    values={form.values}
                    setValues={form.setValues}
                    setTouched={form.setTouched}
                    errors={form.errors}
                    visibleError={form.visibleError}
                    valid={form.valid}
                    onSubmit={() => {
                      void submit(form.values);
                    }}
                  />
                </section>
              ) : null}
            </div>
          </div>

          <aside className="lg:pt-24">
            <TransactionHistory />
          </aside>
        </div>
      </main>
    </>
  );
}
