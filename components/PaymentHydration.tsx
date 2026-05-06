"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePaymentStore } from "@/store/usePaymentStore";

/**
 * Marks `hasRehydrated` once persisted history finishes loading on the client.
 */
export function PaymentHydration({ children }: { children: ReactNode }) {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const finish = (): void => {
      usePaymentStore.getState().setHasRehydrated(true);
    };

    const unsub = usePaymentStore.persist.onFinishHydration(finish);
    void Promise.resolve(usePaymentStore.persist.rehydrate()).then(() => {
      finish();
    });

    return () => {
      unsub?.();
    };
  }, []);

  return children;
}
