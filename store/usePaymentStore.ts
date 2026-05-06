import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CurrencyCode,
  PaymentFlowStatus,
  Transaction,
  TransactionHistoryStatus,
} from "@/types";

function nowIso(): string {
  return new Date().toISOString();
}

interface PaymentState {
  /** True after localStorage rehydration finishes (client only). */
  hasRehydrated: boolean;
  paymentFlow: PaymentFlowStatus;
  activeTransactionId: string | null;
  /** Current checkout session: 1–3 attempts shown to the user */
  currentAttempt: number;
  lastUserMessage: string | null;
  lastFailureReason: string | null;
  selectedTransactionId: string | null;

  transactionHistory: Transaction[];

  setHasRehydrated: (v: boolean) => void;
  setPaymentFlow: (status: PaymentFlowStatus) => void;
  setSelectedTransactionId: (id: string | null) => void;

  startNewPaymentSession: () => void;
  /**
   * Registers or updates a row for this payment. Same `id` keeps a single history entry.
   */
  upsertTransaction: (input: {
    id: string;
    amount: number;
    currency: CurrencyCode;
    status: TransactionHistoryStatus;
    attemptCount: number;
    lastFailureReason?: string;
    lastUserMessage?: string;
  }) => void;
  resetAfterSuccessView: () => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      hasRehydrated: false,
      paymentFlow: "idle",
      activeTransactionId: null,
      currentAttempt: 0,
      lastUserMessage: null,
      lastFailureReason: null,
      selectedTransactionId: null,
      transactionHistory: [],

      setHasRehydrated: (v) => set({ hasRehydrated: v }),

      setPaymentFlow: (status) => set({ paymentFlow: status }),

      setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),

      startNewPaymentSession: () =>
        set({
          activeTransactionId: null,
          currentAttempt: 0,
          paymentFlow: "idle",
          lastUserMessage: null,
          lastFailureReason: null,
          selectedTransactionId: null,
        }),

      resetAfterSuccessView: () =>
        set({
          activeTransactionId: null,
          currentAttempt: 0,
          paymentFlow: "idle",
          lastUserMessage: null,
          lastFailureReason: null,
          selectedTransactionId: null,
        }),

      upsertTransaction: (input) => {
        const ts = nowIso();
        set((state) => {
          const prev = state.transactionHistory.find((t) => t.id === input.id);
          const createdAt = prev?.createdAt ?? ts;
          const row: Transaction = {
            id: input.id,
            amount: input.amount,
            currency: input.currency,
            status: input.status,
            createdAt,
            updatedAt: ts,
            attemptCount: input.attemptCount,
            lastFailureReason: input.lastFailureReason ?? prev?.lastFailureReason,
            lastUserMessage: input.lastUserMessage ?? prev?.lastUserMessage,
          };
          const without = state.transactionHistory.filter((t) => t.id !== input.id);
          const nextHistory = [row, ...without];
          return { transactionHistory: nextHistory };
        });
      },
    }),
    {
      name: "payment-gateway-storage",
      partialize: (state) => ({ transactionHistory: state.transactionHistory }),
      onRehydrateStorage: () => {
        return () => {
          usePaymentStore.getState().setHasRehydrated(true);
        };
      },
    },
  ),
);

export const maxPaymentAttempts = 3;
