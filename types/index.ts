export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type CurrencyCode = "INR" | "USD";

/** UI + store lifecycle for the current checkout attempt */
export type PaymentFlowStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "timeout";

/** Stored row for the transaction list */
export type TransactionHistoryStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "timeout";

/** Assignment wording — persisted transaction row status */
export type PaymentStatus = TransactionHistoryStatus;

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  /** Last server-provided decline reason when failed */
  lastFailureReason?: string;
  /** User-facing explanation (never raw Error) */
  lastUserMessage?: string;
}

export interface PaymentPayload {
  transactionId: string;
  amount: number;
  currency: CurrencyCode;
  /** Last 4 digits only; production systems must tokenize—never send raw PAN. */
  cardLast4: string;
  cardholderName: string;
}

export type PayApiOutcome =
  | { outcome: "success"; transactionId: string }
  | {
      outcome: "failed";
      transactionId: string;
      reason: string;
    };

export interface PaymentFormValues {
  cardholderName: string;
  cardNumberDigits: string;
  expiryMmYy: string;
  cvv: string;
  amount: string;
  currency: CurrencyCode;
}

export type PaymentFormFieldErrors = Partial<
  Record<
    keyof PaymentFormValues,
    string | undefined
  >
>;

export type TouchedFields = Partial<Record<keyof PaymentFormValues, boolean>>;
