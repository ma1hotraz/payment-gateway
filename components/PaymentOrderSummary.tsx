"use client";

import type { CurrencyCode } from "@/types";

interface PaymentOrderSummaryProps {
  amount: string;
  currency: CurrencyCode;
}

/** Sidebar total — mirrors form amount until submit */
export function PaymentOrderSummary({ amount, currency }: PaymentOrderSummaryProps) {
  const n = Number.parseFloat(amount.trim());
  const formatted =
    Number.isFinite(n) && n > 0
      ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "0.00";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payment</p>
      <div className="mt-3 border-t border-dashed border-slate-200 pt-3">
        <p className="text-xs text-slate-500">Amount due</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          <span className="tabular-nums">{formatted}</span>{" "}
          <span className="text-base font-semibold text-slate-600">{currency}</span>
        </p>
      </div>
    </div>
  );
}
