"use client";

import { useCallback, useRef } from "react";
import type { PaymentFormValues } from "@/types";
import { digitsOnly } from "@/utils/formatCardNumber";
import { delay } from "@/utils/delay";
import { postPayment } from "@/utils/payApi";
import { isFormFullyValid } from "@/utils/validate";
import { maxPaymentAttempts, usePaymentStore } from "@/store/usePaymentStore";

export function usePaymentSubmit() {
  const inFlightRef = useRef(false);

  const submit = useCallback(async (values: PaymentFormValues) => {
    if (!isFormFullyValid(values)) return;
    if (inFlightRef.current) return;

    const snapshot = usePaymentStore.getState();
    if (snapshot.paymentFlow === "processing") return;

    if (
      snapshot.activeTransactionId !== null &&
      snapshot.currentAttempt >= maxPaymentAttempts &&
      (snapshot.paymentFlow === "failed" || snapshot.paymentFlow === "timeout")
    ) {
      return;
    }

    /** Held for the whole attempt so double-clicks / duplicate submits cannot start two payments. */
    inFlightRef.current = true;

    let controller: AbortController | undefined;
    let timeoutId = 0;
    try {
      let transactionId = snapshot.activeTransactionId;
      let nextAttempt: number;

      if (!transactionId) {
        transactionId = crypto.randomUUID();
        nextAttempt = 1;
        usePaymentStore.setState({
          activeTransactionId: transactionId,
          currentAttempt: nextAttempt,
          lastUserMessage: null,
          lastFailureReason: null,
        });
      } else {
        nextAttempt = snapshot.currentAttempt + 1;
        if (nextAttempt > maxPaymentAttempts) {
          return;
        }
        usePaymentStore.setState({
          currentAttempt: nextAttempt,
          lastUserMessage: null,
          lastFailureReason: null,
        });
      }

      const amount = Number.parseFloat(values.amount.trim());
      const pan = digitsOnly(values.cardNumberDigits);
      const last4 = pan.slice(-4);

      const upsert = usePaymentStore.getState().upsertTransaction;
      const setFlow = usePaymentStore.getState().setPaymentFlow;

      setFlow("processing");
      upsert({
        id: transactionId,
        amount,
        currency: values.currency,
        status: "processing",
        attemptCount: nextAttempt,
      });

      controller = new AbortController();
      timeoutId = window.setTimeout(() => {
        controller?.abort();
      }, 6000);

      try {
        const payload = {
          transactionId,
          amount,
          currency: values.currency,
          cardLast4: last4,
          cardholderName: values.cardholderName.trim(),
        };

        const [, result] = await Promise.all([
          delay(2000),
          postPayment(payload, controller.signal),
        ]);

        if (result.kind === "success") {
          const msg = `Payment of ${values.currency} ${amount.toFixed(2)} completed successfully.`;
          usePaymentStore.setState({
            paymentFlow: "success",
            lastUserMessage: msg,
            lastFailureReason: null,
          });
          upsert({
            id: transactionId,
            amount,
            currency: values.currency,
            status: "success",
            attemptCount: nextAttempt,
            lastUserMessage: msg,
          });
          return;
        }

        const reason = result.kind === "failed" ? result.reason : undefined;
        const terminalFlow: "failed" | "timeout" =
          result.kind === "timeout" ? "timeout" : "failed";
        const userMessage = result.userMessage;

        usePaymentStore.setState({
          paymentFlow: terminalFlow,
          lastUserMessage: userMessage,
          lastFailureReason: reason,
        });

        upsert({
          id: transactionId,
          amount,
          currency: values.currency,
          status: terminalFlow,
          attemptCount: nextAttempt,
          lastFailureReason: reason,
          lastUserMessage: userMessage,
        });
      } catch {
        const fallback = "We could not process this payment. Please try again.";
        usePaymentStore.setState({
          paymentFlow: "failed",
          lastUserMessage: fallback,
          lastFailureReason: undefined,
        });
        upsert({
          id: transactionId,
          amount,
          currency: values.currency,
          status: "failed",
          attemptCount: nextAttempt,
          lastUserMessage: fallback,
        });
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  return { submit };
}
