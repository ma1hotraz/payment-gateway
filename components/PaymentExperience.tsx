"use client";

import { CardPreview } from "@/components/CardPreview";
import { CheckoutBrand } from "@/components/CheckoutBrand";
import { PaymentForm } from "@/components/PaymentForm";
import { PaymentOrderSummary } from "@/components/PaymentOrderSummary";
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
        className="fixed left-4 top-4 z-[100] rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Skip to checkout
      </a>
      <main
        id="checkout-main"
        tabIndex={-1}
        className="checkout-shell outline-none motion-reduce:scroll-auto lg:max-h-dvh lg:overflow-hidden"
      >
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5 lg:flex lg:max-h-dvh lg:flex-col lg:px-8 lg:py-5">
          <header className="mb-4 shrink-0 sm:mb-5 lg:mb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <CheckoutBrand />
              <p className="max-w-xl text-xs leading-snug text-slate-600 sm:text-right sm:text-sm">
                Charges are confirmed with your card issuer using industry-standard encryption.
              </p>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 gap-6 pb-4 lg:grid-cols-[minmax(0,1fr)_min(360px,100%)] lg:gap-8 lg:overflow-hidden lg:pb-0 xl:gap-10">
            <div className="flex min-h-0 flex-col gap-3 overflow-y-auto lg:pr-1">
              <div aria-live="polite" className="flex min-h-0 flex-col gap-3">
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
                    aria-label="Payment details"
                    className="shrink-0 rounded-2xl border border-white/70 bg-white/90 px-4 py-5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:px-6 sm:py-5"
                  >
                    <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">Pay with card</h2>
                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                          Card must be in your name.
                        </p>
                      </div>
                      {nextAttemptNumber ? (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Next attempt {nextAttemptNumber}/{maxPaymentAttempts}
                        </p>
                      ) : flow === "processing" ? (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Attempt {Math.min(currentAttempt, maxPaymentAttempts)}/{maxPaymentAttempts}
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

            <aside className="flex min-h-0 flex-col gap-3 lg:max-h-full lg:overflow-y-auto lg:pb-2">
              <CardPreview
                cardType={cardType}
                cardNumberDigits={form.values.cardNumberDigits}
                cardholderName={form.values.cardholderName}
                expiryMmYy={form.values.expiryMmYy}
              />
              <PaymentOrderSummary amount={form.values.amount} currency={form.values.currency} />
              <div className="min-h-0 flex-1 lg:min-h-0">
                <TransactionHistory />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
