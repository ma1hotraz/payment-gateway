"use client";

import type { Transaction } from "@/types";
import { usePaymentStore } from "@/store/usePaymentStore";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusLabel(status: Transaction["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "success":
      return "Success";
    case "failed":
      return "Failed";
    case "timeout":
      return "Timeout";
  }
}

export function TransactionHistory() {
  const hasRehydrated = usePaymentStore((s) => s.hasRehydrated);
  const items = usePaymentStore((s) => s.transactionHistory);
  const selectedId = usePaymentStore((s) => s.selectedTransactionId);
  const setSelectedId = usePaymentStore((s) => s.setSelectedTransactionId);

  const selected = items.find((t) => t.id === selectedId) ?? null;

  if (!hasRehydrated) {
    return (
      <section
        aria-label="Transaction history loading"
        className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm"
      >
        <p className="text-sm text-slate-500">Loading recent activity…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section
        aria-labelledby="history-heading"
        className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-5 shadow-sm"
      >
        <h2 id="history-heading" className="text-sm font-bold text-slate-900">
          Recent payments
        </h2>
        <p className="mt-2 text-sm text-slate-500">Completed transactions will appear here on this device.</p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="history-heading"
      className="grid gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 id="history-heading" className="text-sm font-bold text-slate-900">
          Recent payments
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {items.length} saved
        </span>
      </div>

      <ul
        className="max-h-[min(14rem,34vh)] space-y-2 overflow-auto pr-1 lg:max-h-[min(12rem,28vh)]"
        role="list"
      >
        {items.map((txn) => {
          const sel = txn.id === selectedId;
          return (
            <li key={txn.id}>
              <button
                type="button"
                onClick={() => setSelectedId(sel ? null : txn.id)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  sel
                    ? "border-[#2563eb] bg-blue-50/70 ring-2 ring-[#2563eb]/35"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
                }`}
                aria-current={sel ? "true" : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-[11px] text-slate-500">{txn.id}</span>
                  <span className="text-xs font-bold text-slate-800">{statusLabel(txn.status)}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-slate-500">
                  <span>
                    <span className="sr-only">Amount:</span>
                    <span aria-hidden>{txn.currency}</span>{" "}
                    <span className="font-medium tabular-nums text-slate-700">{txn.amount.toFixed(2)}</span>
                  </span>
                  <time dateTime={txn.updatedAt}>{formatWhen(txn.updatedAt)}</time>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-700">
        {selected ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Details
            </p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Reference ID</dt>
                <dd className="break-all font-mono text-[11px] text-slate-800">{selected.id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-semibold text-slate-900">{statusLabel(selected.status)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-medium tabular-nums">
                  {selected.currency} {selected.amount.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Attempts</dt>
                <dd>{selected.attemptCount}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Created</dt>
                <dd>
                  <time dateTime={selected.createdAt}>{formatWhen(selected.createdAt)}</time>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Last updated</dt>
                <dd>
                  <time dateTime={selected.updatedAt}>{formatWhen(selected.updatedAt)}</time>
                </dd>
              </div>
              {selected.lastUserMessage ? (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Note</dt>
                  <dd>{selected.lastUserMessage}</dd>
                </div>
              ) : null}
              {selected.lastFailureReason ? (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Issuer notice</dt>
                  <dd>{selected.lastFailureReason}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <p className="text-slate-600">Tap a payment to expand details.</p>
        )}
      </div>
    </section>
  );
}
