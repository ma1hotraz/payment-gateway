import type { PaymentPayload, PayApiOutcome } from "@/types";

const TIMEOUT_USER_MESSAGE =
  "The payment took too long and was cancelled. Please check your connection and try again.";

const NETWORK_USER_MESSAGE =
  "We could not reach the payment service. Check your network and try again.";

const GENERIC_USER_MESSAGE =
  "Something went wrong while processing your payment. Please try again.";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parsePayOutcome(json: unknown): PayApiOutcome | undefined {
  if (!isRecord(json)) return undefined;
  const outcome = json.outcome;
  const transactionId = json.transactionId;
  if (outcome !== "success" && outcome !== "failed") return undefined;
  if (typeof transactionId !== "string") return undefined;
  if (outcome === "success") return { outcome: "success", transactionId };
  const reason = json.reason;
  if (typeof reason !== "string") return undefined;
  return { outcome: "failed", transactionId, reason };
}

export type PayResult =
  | { kind: "success"; payload: Extract<PayApiOutcome, { outcome: "success" }> }
  | { kind: "failed"; userMessage: string; reason?: string }
  | { kind: "timeout"; userMessage: string }
  | { kind: "network"; userMessage: string };

/** Friendly decline copy — server reason is sanitized to short strings only */
export function friendlyDecline(reason: string): string {
  const r = reason.trim().toLowerCase();
  const map: Record<string, string> = {
    "insufficient funds": "Your bank declined this payment due to insufficient funds.",
    "card declined": "Your card was declined. Try another card or contact your bank.",
    "lost card": "This card cannot be used. Contact your bank.",
    expired: "This card appears expired.",
    restricted: "This card cannot be used for this transaction.",
    "do not honour": "Your bank could not authorize this payment.",
  };
  return map[r] ?? "Your payment could not be completed. Please try another method.";
}

function abortedName(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function isAbortLike(err: unknown): boolean {
  if (err instanceof Error && err.name === "AbortError") return true;
  return abortedName(err);
}

/**
 * POST `/api/pay`. Caller should pass an `AbortSignal` (e.g. 6s client timeout).
 */
export async function postPayment(
  body: PaymentPayload,
  signal: AbortSignal,
): Promise<PayResult> {
  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    let json: unknown;
    try {
      json = (await res.json()) as unknown;
    } catch {
      return { kind: "network", userMessage: NETWORK_USER_MESSAGE };
    }

    const outcome = parsePayOutcome(json);
    if (!outcome) {
      return { kind: "network", userMessage: GENERIC_USER_MESSAGE };
    }

    if (outcome.outcome === "success") {
      if (res.ok) return { kind: "success", payload: outcome };
      return { kind: "network", userMessage: GENERIC_USER_MESSAGE };
    }

    const userMessage = friendlyDecline(outcome.reason);
    return { kind: "failed", userMessage, reason: outcome.reason };
  } catch (err: unknown) {
    if (isAbortLike(err)) {
      return { kind: "timeout", userMessage: TIMEOUT_USER_MESSAGE };
    }
    return { kind: "network", userMessage: NETWORK_USER_MESSAGE };
  }
}
