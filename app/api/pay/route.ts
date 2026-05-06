import { NextResponse } from "next/server";
import type { CurrencyCode } from "@/types";
import { delay } from "@/utils/delay";

const FAIL_REASONS = [
  "Insufficient funds",
  "Card declined",
  "Expired",
  "Do not honour",
] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parsePayload(body: unknown): {
  transactionId: string;
  amount: number;
  currency: CurrencyCode;
} | null {
  if (!isRecord(body)) return null;
  const transactionId = body.transactionId;
  const amount = body.amount;
  const currency = body.currency;
  if (typeof transactionId !== "string" || transactionId.length < 10) return null;
  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) return null;
  if (currency !== "INR" && currency !== "USD") return null;
  return { transactionId, amount, currency };
}

export async function POST(req: Request) {
  let jsonBody: unknown;
  try {
    jsonBody = (await req.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parsePayload(jsonBody);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
  }

  const { transactionId } = parsed;
  const r = Math.random();

  if (r < 0.15) {
    await delay(8000);
    const slowOk = Math.random() < 0.6;
    if (slowOk) {
      return NextResponse.json({ outcome: "success", transactionId } satisfies Record<string, string>);
    }
    const reason = FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)] ?? FAIL_REASONS[0];
    return NextResponse.json({
      outcome: "failed",
      transactionId,
      reason,
    });
  }

  if (r < 0.4) {
    const reason = FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)] ?? FAIL_REASONS[0];
    return NextResponse.json({
      outcome: "failed",
      transactionId,
      reason,
    });
  }

  return NextResponse.json({ outcome: "success", transactionId });
}
